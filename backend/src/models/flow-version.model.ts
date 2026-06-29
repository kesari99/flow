import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  FlowVersionAttributes,
  FlowVersionCreationAttributes,
} from '@shared/schemas/chat.schema';

export class FlowVersion
  extends Model<FlowVersionAttributes, FlowVersionCreationAttributes>
  implements FlowVersionAttributes
{
  public id!: string;
  public flow_id!: number;
  public data!: Record<string, unknown>;
  public inputs!: Record<string, unknown> | null;
  public author!: string;
  public comment!: string | null;
  public version_number!: number;

  static associate(models: any): void {
    FlowVersion.belongsTo(models.ChatFlow, {
      foreignKey: 'flow_id',
      as: 'chatFlow',
    });
  }
}

export function initFlowVersion(sequelize: Sequelize): typeof FlowVersion {
  FlowVersion.init(
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
      data: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      inputs: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      version_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'flow_versions',
      timestamps: true,
      updatedAt: false,
    }
  );

  return FlowVersion;
}
