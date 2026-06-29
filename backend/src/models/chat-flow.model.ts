import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ChatFlowAttributes,
  ChatFlowCreationAttributes,
} from '@shared/schemas/chat.schema';

export class ChatFlow
  extends Model<ChatFlowAttributes, ChatFlowCreationAttributes>
  implements ChatFlowAttributes
{
  public id!: number;
  public name!: string;
  public description!: string | null;
  public flow_data!: Record<string, unknown>;
  public deployed!: boolean;
  public is_public!: boolean;
  public author_id!: number;
  public workspace_id!: number;
  public chatbot_config!: Record<string, unknown> | null;
  public runtime_config!: Record<string, unknown> | null;

  static associate(models: any): void {
    ChatFlow.hasMany(models.ChatMessage, {
      foreignKey: 'chatflow_id',
      as: 'messages',
    });
    ChatFlow.hasMany(models.FlowVersion, {
      foreignKey: 'flow_id',
      as: 'versions',
    });
    ChatFlow.hasMany(models.RuntimeSession, {
      foreignKey: 'flow_id',
      as: 'sessions',
    });
  }
}

export function initChatFlow(sequelize: Sequelize): typeof ChatFlow {
  ChatFlow.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      flow_data: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      deployed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      workspace_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chatbot_config: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      runtime_config: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'chat_flows',
      timestamps: true,
    }
  );

  return ChatFlow;
}
