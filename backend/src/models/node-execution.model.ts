import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  NodeExecutionAttributes,
  NodeExecutionCreationAttributes,
} from '@shared/schemas/chat.schema';

export class NodeExecution
  extends Model<NodeExecutionAttributes, NodeExecutionCreationAttributes>
  implements NodeExecutionAttributes
{
  public id!: number;
  public session_id!: string;
  public node_id!: string;
  public node_type!: string;
  public inputs!: Record<string, unknown> | null;
  public outputs!: Record<string, unknown> | null;
  public execution_time!: number | null;
  public status!: string;
  public error!: string | null;
  public timestamp!: Date;

  static associate(models: any): void {
    NodeExecution.belongsTo(models.RuntimeSession, {
      foreignKey: 'session_id',
      as: 'session',
    });
  }
}

export function initNodeExecution(sequelize: Sequelize): typeof NodeExecution {
  NodeExecution.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'runtime_sessions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      node_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      node_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      inputs: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      outputs: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      execution_time: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'node_executions',
      timestamps: false,
    }
  );

  return NodeExecution;
}
