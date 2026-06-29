import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { UserRole } from '@shared/schemas/auth.schema';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import dbConfig from './config/database';
import { userStorage } from './storage/user.storage';
import { pathToRegex } from './utils/common';
import { API_ENDPOINTS, ROUTE_BASE } from '@server/constants/api';
import { getRolesByRouteKey } from '@shared/constants/role-permissions';

const PgSessionStore = connectPgSimple(session);

const pgPool = new Pool({
  connectionString: dbConfig.url,
  ssl: dbConfig?.dialectOptions?.ssl,
});

export const sessionStore = new PgSessionStore({
  pool: pgPool,
  tableName: 'user_sessions',
  createTableIfMissing: true,
});

const scryptAsync = promisify(scrypt);

export interface AuthRequest extends Request {
  user?: Express.User;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      is_active: boolean;
    }
  }
}

export const checkRole = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { path } = req;

    if (!path.startsWith('/api/')) {
      return next();
    }

    const { API, ...routeWithoutAPI } = ROUTE_BASE;

    const routeEntry = Object.entries(routeWithoutAPI).find(([_, basePath]) =>
      path.startsWith(basePath)
    );

    if (!routeEntry) {
      return next();
    }

    const [key, basePath] = routeEntry;
    const apiEndpoint = path.slice(basePath.length);
    const endpoints = API_ENDPOINTS[key as keyof typeof API_ENDPOINTS];

    if (!endpoints) {
      return res.status(500).json({ message: 'API endpoint config missing' });
    }

    const apiObject = Object.entries(endpoints).find(([_, endpoint]) => {
      const routeRegex = pathToRegex(endpoint.path);
      return routeRegex.test(apiEndpoint) && endpoint.method === req.method;
    });

    if (!apiObject) {
      return res.status(404).json({ message: 'Endpoint not registered' });
    }

    const [endpointKey] = apiObject;
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const allowedRoles = getRolesByRouteKey(key, endpointKey);
    if (allowedRoles.length === 0) {
      return res.status(500).json({
        message: `Role policy missing for ${key}.${endpointKey}`,
      });
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
};

export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  if (!stored || !stored.includes('.')) {
    return false;
  }

  const [hashed, salt] = stored.split('.');
  if (!hashed || !salt) {
    return false;
  }

  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const secure =
    process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'uat';

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'promptflow-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'promptflow.sid',
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure,
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
    },
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await userStorage.getUserByEmail(email);

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          if (!user.is_active) {
            return done(null, false, { message: 'User account is inactive' });
          }

          if (await comparePasswords(password, user.password)) {
            return done(null, { ...user, is_active: user.is_active ?? true });
          }

          return done(null, false, { message: 'Invalid email or password' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await userStorage.getUser(id);
      if (!user) {
        done(null, false);
        return;
      }
      done(null, { ...user, is_active: user.is_active ?? true });
    } catch (error) {
      done(error);
    }
  });

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.includes('/api')) {
      next();
      return;
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    next();
  };

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  return { requireAuth };
}
