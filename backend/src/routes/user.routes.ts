import { Router } from 'express';
import { userStorage } from '../storage/user.storage';
import { createUserSchema, UserRole } from '@shared/schemas/auth.schema';
import { AuthRequest, hashPassword } from '../auth';
import { validatePasswordStrength } from '@server/utils/common';
import { USERS_ENDPOINTS } from '@server/constants/api';

const router = Router();

router.get(USERS_ENDPOINTS.LIST.path, async (_, res) => {
  const users = await userStorage.getAllUsers();
  const safeUsers = users.map(({ password, ...safeUser }) => safeUser);
  res.json(safeUsers);
});

router.get(USERS_ENDPOINTS.GET_BY_ID.path, async (req: AuthRequest, res) => {
  const user = await userStorage.getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

router.post(USERS_ENDPOINTS.CREATE.path, async (req: AuthRequest, res) => {
  try {
    const parsed = createUserSchema.parse(req.body);
    const role = parsed.role || UserRole.USER;

    if (role !== UserRole.USER) {
      return res
        .status(403)
        .json({ message: 'Forbidden: invalid role assignment' });
    }

    const existingUser = await userStorage.getUserByEmail(parsed.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordValidation = validatePasswordStrength(parsed.password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const user = await userStorage.createUser({
      ...parsed,
      password: await hashPassword(parsed.password),
      role,
    });

    const { password, ...safeUser } = user;
    return res.status(201).json(safeUser);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

router.patch(USERS_ENDPOINTS.UPDATE.path, async (req: AuthRequest, res) => {
  const user = await userStorage.getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isSelf = req.user?.id === user.id;
  const isAdmin = req.user?.role === UserRole.ADMIN;

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const updateData: Record<string, unknown> = {};
  if (req.body.name) updateData.name = req.body.name;

  if (req.body.password) {
    const passwordValidation = validatePasswordStrength(req.body.password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    updateData.password = await hashPassword(req.body.password);
  }

  if (isAdmin && typeof req.body.is_active === 'boolean') {
    updateData.is_active = req.body.is_active;
  }

  const updatedUser = await userStorage.updateUser(req.params.id, updateData);
  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password, ...safeUser } = updatedUser;
  res.json(safeUser);
});

export default router;
