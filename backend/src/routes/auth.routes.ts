import passport from 'passport';
import { Router } from 'express';
import { userStorage } from '../storage/user.storage';
import {
  hashPassword,
  comparePasswords,
  AuthRequest,
} from '../auth';
import { validatePasswordStrength } from '@server/utils/common';
import { AUTH_ENDPOINTS } from '@server/constants/api';
import { customLogger } from '../utils/logger';
import { UserRole } from '@shared/schemas/auth.schema';

const router = Router();

const failedLoginAttempts = new Map<string, number>();
const MAX_FAILED_ATTEMPTS = 3;

router.post(
  AUTH_ENDPOINTS.REGISTER.path,
  async (req: AuthRequest, res) => {
    try {
      if (
        !req.isAuthenticated() ||
        !req.user ||
        req.user.role !== UserRole.ADMIN
      ) {
        return res.status(req.isAuthenticated() ? 403 : 401).json({
          message: req.isAuthenticated()
            ? 'Forbidden: admin access required'
            : 'Authentication required',
        });
      }

      const role = req.body.role || UserRole.USER;
      if (role !== UserRole.USER) {
        return res
          .status(403)
          .json({ message: 'Forbidden: invalid role assignment' });
      }

      const existingUser = await userStorage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const passwordValidation = validatePasswordStrength(req.body.password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      const user = await userStorage.createUser({
        ...req.body,
        password: await hashPassword(req.body?.password ?? ''),
        role,
      });

      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      customLogger.error('Registration failed', { error: error.message });
      return res.status(500).json({ message: error.message });
    }
  }
);

router.post(AUTH_ENDPOINTS.RESET_PASSWORD.path, async (req, res) => {
  try {
    const { newPassword, oldPassword } = req.body;

    if (!req.user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const existingUser = await userStorage.getUser(req.user.id);
    if (!existingUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await comparePasswords(oldPassword, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    await userStorage.updateUser(req.user.id, {
      password: await hashPassword(newPassword),
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.post(AUTH_ENDPOINTS.LOGIN.path, (req: AuthRequest, res) => {
  const { email } = req.body;

  passport.authenticate(
    'local',
    async (err: Error | null, user: any, info: { message: string }) => {
      if (err) return res.status(500).json({ message: err.message });

      if (!user) {
        const existingUser = await userStorage.getUserByEmail(email);

        if (existingUser) {
          const currentAttempts = (failedLoginAttempts.get(email) || 0) + 1;

          if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
            await userStorage.updateUser(existingUser.id, { is_active: false });
            failedLoginAttempts.delete(email);
            customLogger.warn('Account deactivated due to brute-force attempts', {
              email,
              attempts: currentAttempts,
            });
          } else {
            failedLoginAttempts.set(email, currentAttempts);
          }
        }

        return res
          .status(400)
          .json({ message: info?.message || 'Invalid email or password' });
      }

      failedLoginAttempts.delete(email);

      req.login(user, (loginErr: Error | null) => {
        if (loginErr) return res.status(500).json({ message: loginErr.message });

        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    }
  )(req, res);
});

router.post(AUTH_ENDPOINTS.LOGOUT.path, (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: err.message });
    req.session.destroy((destroyErr) => {
      if (destroyErr) return res.status(500).json({ message: destroyErr.message });
      res.clearCookie('promptflow.sid', {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'uat',
        sameSite: 'lax',
        path: '/',
      });
      res.sendStatus(200);
    });
  });
});

export default router;
