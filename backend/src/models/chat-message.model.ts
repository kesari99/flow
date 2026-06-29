import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ChatMessageAttributes,
  ChatMessageCreationAttributes,
} from '@shared/schemas/chat.schema';

export class ChatMessage
  extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>
  implements ChatMessageAttributes
{
  public id!: number;
  public session_id!: string;
  public chatflow_id!: number;
  public role!: string;
  public content!: string;
  public source_documents!: Record<string, unknown>[] | null;
  public file_annotations!: Record<string, unknown>[] | null;

  static associate(models: any): void {
    ChatMessage.belongsTo(models.ChatFlow, {
      foreignKey: 'chatflow_id',
      as: 'chatFlow',
    });
    ChatMessage.belongsTo(models.RuntimeSession, {
      foreignKey: 'session_id',
      targetKey: 'id',
      as: 'session',
    });
  }
}

export function initChatMessage(sequelize: Sequelize): typeof ChatMessage {
  ChatMessage.init(
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
      chatflow_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_flows',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      source_documents: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      file_annotations: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'chat_messages',
      timestamps: true,
      updatedAt: false,
    }
  );

  return ChatMessage;
}
