import { UserSessionAttributes } from '@shared/schemas/auth.schema';
import { Model, DataTypes, Sequelize } from 'sequelize';

export class UserSession
  extends Model<UserSessionAttributes, UserSessionAttributes>
  implements UserSessionAttributes
{
  public sid!: string;
  public sess!: JSON;
  public expire!: string;
}

export function initUserSession(sequelize: Sequelize): typeof UserSession {
  UserSession.init(
    {
      sid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        comment: 'UserSession_field1: Unique identifier for the session',
      },
      sess: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: null,
        comment: 'UserSession_field2: Session data',
      },
      expire: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'UserSession_field3: Expiration date of the session',
      },
    },
    {
      sequelize,
      tableName: 'user_sessions',
      timestamps: false,
      indexes: [
        {
          fields: ['sid'],
          unique: true,
        },
        {
          fields: ['expire'],
        },
      ],
    }
  );
  return UserSession;
}
