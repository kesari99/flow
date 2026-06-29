import db from '../models';
import { UserAttributes, UserCreationAttributes } from '@shared/schemas/auth.schema';

const { User } = db;

class UserStorage {
  async getUser(id: string): Promise<UserAttributes | null> {
    const user = await User.findByPk(id);
    return user?.get({ plain: true }) || null;
  }

  async getUserByEmail(email: string): Promise<UserAttributes | null> {
    const user = await User.findOne({ where: { email } });
    return user?.get({ plain: true }) || null;
  }

  async createUser(userData: UserCreationAttributes): Promise<UserAttributes> {
    const user = await User.create(userData);
    return user.get({ plain: true });
  }

  async updateUser(
    id: string,
    data: Partial<UserCreationAttributes>
  ): Promise<UserAttributes | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(data);
    return user.get({ plain: true });
  }

  async getAllUsers(): Promise<UserAttributes[]> {
    const users = await User.findAll();
    return users.map((user) => user.get({ plain: true }));
  }
}

export const userStorage = new UserStorage();
