import { Sequelize } from 'sequelize';
import { initUser } from './user.model';
import { initUserSession } from './user-session.model';
import { initChatFlow } from './chat-flow.model';
import { initChatMessage } from './chat-message.model';
import { initRuntimeSession } from './runtime-session.model';
import { initFlowVersion } from './flow-version.model';
import { initNodeExecution } from './node-execution.model';
import dbConfig from '../config/database';

let sequelize: Sequelize;

if (dbConfig.url) {
  sequelize = new Sequelize(dbConfig.url, {
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    logging: dbConfig.logging,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
    pool: {
      max: dbConfig.pool?.max || 10,
      min: dbConfig.pool?.min || 0,
      acquire: dbConfig.pool?.acquire || 30000,
      idle: dbConfig.pool?.idle || 10000,
    },
  });
} else {
  throw new Error('Database URL is not defined');
}

const User = initUser(sequelize);
const UserSession = initUserSession(sequelize);
const ChatFlow = initChatFlow(sequelize);
const ChatMessage = initChatMessage(sequelize);
const RuntimeSession = initRuntimeSession(sequelize);
const FlowVersion = initFlowVersion(sequelize);
const NodeExecution = initNodeExecution(sequelize);

const models = {
  User,
  UserSession,
  ChatFlow,
  ChatMessage,
  RuntimeSession,
  FlowVersion,
  NodeExecution,
};

Object.values(models)
  .filter((model: any) => typeof model.associate === 'function')
  .forEach((model: any) => model.associate(models));

export const db = {
  sequelize,
  Sequelize,
  ...models,
};

export {
  User,
  UserSession,
  ChatFlow,
  ChatMessage,
  RuntimeSession,
  FlowVersion,
  NodeExecution,
};

export default db;
