import { z } from 'zod';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

export interface UserSessionAttributes {
  sid: string;
  sess: JSON;
  expire: string;
}

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([UserRole.USER]),
});

export const createUserSchema = registerUserSchema;

export const resetPasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(8),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
