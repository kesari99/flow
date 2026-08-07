import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { checkRole, setupAuth } from './auth';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import healthRouter from './routes/health.routes';
import { createChatDomainRoutes } from './routes/chat-domain.routes';
import { httpLogger } from './utils/logger';
import { ROUTE_BASE } from '@server/constants/api';
import { db } from '@server/models';

export async function registerRoutes(app: Express): Promise<Server> {
  const { requireAuth } = setupAuth(app);

  app.use(ROUTE_BASE.API, healthRouter);
  app.use(ROUTE_BASE.AUTH, authRoutes);

  app.use(requireAuth);
  app.use(checkRole());
  app.use(httpLogger);

  app.use(ROUTE_BASE.USERS, userRoutes);
  app.use(ROUTE_BASE.API, createChatDomainRoutes(db.sequelize));

  return createServer(app);
}
