import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  RuntimeSessionAttributes,
  RuntimeSessionCreationAttributes,
  RuntimeSessionStatus,
} from '@shared/schemas/chat.schema';

export class RuntimeSession
  extends Model<RuntimeSessionAttributes, RuntimeSessionCreationAttributes>
  implements RuntimeSessionAttributes
{
  public id!: string;
  public flow_id!: number;
  public user_id!: string;
  public inputs!: Record<string, unknown> | null;
  public variables!: Record<string, unknown> | null;
  public outputs!: Record<string, unknown> | null;
  public status!: RuntimeSessionStatus;
  public metadata!: Record<string, unknown> | null;
  public started_at!: Date;
  public completed_at!: Date | null;

  static associate(models: any): void {
    RuntimeSession.belongsTo(models.ChatFlow, {
      foreignKey: 'flow_id',
      as: 'chatFlow',
    });
    RuntimeSession.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    RuntimeSession.hasMany(models.NodeExecution, {
      foreignKey: 'session_id',
      as: 'nodeExecutions',
    });
    RuntimeSession.hasMany(models.ChatMessage, {
      foreignKey: 'session_id',
      sourceKey: 'id',
      as: 'messages',
    });
  }
}

export function initRuntimeSession(sequelize: Sequelize): typeof RuntimeSession {
  RuntimeSession.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      flow_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_flows',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      inputs: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      variables: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      outputs: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'running',
          'completed',
          'failed',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'runtime_sessions',
      timestamps: false,
    }
  );

  return RuntimeSession;
}
