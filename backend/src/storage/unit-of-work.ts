import {
  ChatFlowRepository,
  IChatFlowRepository,
} from "@server/repository/chat-flow.repository";
import {
  ChatMessageRepository,
  IChatMessageRepository,
} from "@server/repository/chat-message.repository";
import {
  FlowVersionRepository,
  IFlowVersionRepository,
} from "@server/repository/flow-version.repository";
import {
  INodeExecutionRepository,
  NodeExecutionRepository,
} from "@server/repository/node-execution.repository";
import {
  IRuntimeSessionRepository,
  RuntimeSessionRepository,
} from "@server/repository/runtime-session.repository";
import { customLogger } from "@server/utils/logger";
import { Sequelize, Transaction } from "sequelize";

export interface IDisposable {
  dispose(): void;
}

export interface IUnitOfWork extends IDisposable {
  readonly chatFlows: IChatFlowRepository;
  readonly chatMessages: IChatMessageRepository;
  readonly flowVersions: IFlowVersionRepository;
  readonly runtimeSessions: IRuntimeSessionRepository;
  readonly nodeExecutions: INodeExecutionRepository;
  readonly transaction: Transaction | null;
  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  withTransaction<T>(
    operation: (unitOfWork: IUnitOfWork) => Promise<T>,
  ): Promise<T>;
}

export class UnitOfWork implements IUnitOfWork, IDisposable {
  private readonly sequelize: Sequelize;
  private _transaction: Transaction | null = null;
  private _disposed = false;

  readonly chatFlows: ChatFlowRepository;
  readonly chatMessages: ChatMessageRepository;
  readonly flowVersions: FlowVersionRepository;
  readonly runtimeSessions: RuntimeSessionRepository;
  readonly nodeExecutions: NodeExecutionRepository;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;

    this.chatFlows = new ChatFlowRepository();
    this.chatMessages = new ChatMessageRepository();
    this.flowVersions = new FlowVersionRepository();
    this.runtimeSessions = new RuntimeSessionRepository();
    this.nodeExecutions = new NodeExecutionRepository();
  }

  get transaction(): Transaction | null {
    return this._transaction;
  }

  async startTransaction(): Promise<void> {
    this.ensureNotDisposed();

    if (this._transaction) {
      throw new Error("Transaction already started");
    }

    customLogger.debug("UnitOfWork: Starting transaction");
    this._transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });
  }

  async commitTransaction(): Promise<void> {
    this.ensureNotDisposed();

    if (!this._transaction) {
      throw new Error("No active transaction to commit");
    }

    customLogger.debug("UnitOfWork: Committing transaction");
    try {
      await this._transaction.commit();
    } finally {
      this._transaction = null;
    }
  }

  async rollbackTransaction(): Promise<void> {
    this.ensureNotDisposed();

    if (!this._transaction) {
      throw new Error("No active transaction to rollback");
    }

    customLogger.debug("UnitOfWork: Rolling back transaction");
    try {
      await this._transaction.rollback();
    } finally {
      this._transaction = null;
    }
  }

  async withTransaction<T>(
    operation: (unitOfWork: IUnitOfWork) => Promise<T>,
  ): Promise<T> {
    await this.startTransaction();
    try {
      const result = await operation(this);
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  private ensureNotDisposed(): void {
    if (this._disposed) {
      throw new Error("UnitOfWork has been disposed");
    }
  }

  dispose(): void {
    if (this._disposed) return;

    customLogger.debug("UnitOfWork: Disposing");

    if (this._transaction) {
      this._transaction.rollback().catch((err) => {
        customLogger.error(
          "UnitOfWork: Error rolling back transaction during disposal",
          err,
        );
      });
      this._transaction = null;
    }

    this._disposed = true;
  }
}
