import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  UserAttributes,
  UserCreationAttributes,
  UserRole,
} from '@shared/schemas/auth.schema';

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public is_active!: boolean;
  public metadata!: Record<string, unknown> | null;
}

export function initUser(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'User_field1: Unique identifier for the user',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'User_field2: Name of the user',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'User_field3: Email address of the user',
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'User_field4: Password of the user',
      },
      role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        comment: 'User_field5: Role of the user',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'User_field6: Indicates if the user is active',
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'User_field7: Extensible metadata',
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
    }
  );
  return User;
}
