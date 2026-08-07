import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { IUnitOfWork } from "@server/storage/unit-of-work";
import { BusinessRuleError, NotFoundError } from "@server/utils/errors";
import {
  RuntimeSessionAttributes,
  RuntimeSessionStatus,
} from "@shared/types";
import { randomUUID } from "crypto";

export interface CreateSessionDTO {
  flowId: number;
  userId: string;
  inputs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SessionListFilters {
  flowId?: number;
  userId?: string;
  status?: RuntimeSessionStatus | RuntimeSessionStatus[];
  startDate?: Date;
  endDate?: Date;
}

export interface IRuntimeSessionService {
  getById(id: string): Promise<RuntimeSessionAttributes>;
  create(data: CreateSessionDTO): Promise<RuntimeSessionAttributes>;
  list(
    filters: SessionListFilters,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSessionAttributes>>;
  complete(
    id: string,
    outputs?: Record<string, unknown>,
  ): Promise<RuntimeSessionAttributes>;
  fail(id: string, error?: string): Promise<RuntimeSessionAttributes>;
  cancel(id: string): Promise<RuntimeSessionAttributes>;
  updateVariables(
    id: string,
    variables: Record<string, unknown>,
  ): Promise<RuntimeSessionAttributes>;
  updateOutputs(
    id: string,
    outputs: Record<string, unknown>,
  ): Promise<RuntimeSessionAttributes>;
  delete(id: string): Promise<void>;
  getSessionStats(id: string): Promise<{
    session: RuntimeSessionAttributes;
    executionStats: {
      totalExecutions: number;
      successfulExecutions: number;
      failedExecutions: number;
      averageExecutionTime: number;
      totalExecutionTime: number;
    };
  }>;
}

export class RuntimeSessionService implements IRuntimeSessionService {
  private readonly unitOfWork: IUnitOfWork;

  constructor(unitOfWork: IUnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  async getById(id: string): Promise<RuntimeSessionAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(id, {
      include: ["chatFlow", "user", "nodeExecutions", "messages"],
    });
    if (!session) throw new NotFoundError("RuntimeSession", id);
    return session.get({ plain: true });
  }

  async create(data: CreateSessionDTO): Promise<RuntimeSessionAttributes> {
    const flow = await this.unitOfWork.chatFlows.findById(data.flowId);
    if (!flow) throw new NotFoundError("ChatFlow", data.flowId);

    if (!flow.deployed) {
      throw new BusinessRuleError(
        "Cannot create a session for an undeployed chat flow",
      );
    }

    const session = await this.unitOfWork.runtimeSessions.createSession({
      id: randomUUID(),
      flow_id: data.flowId,
      user_id: data.userId,
      inputs: data.inputs || null,
      variables: {},
      outputs: null,
      status: "pending",
      metadata: data.metadata || null,
      started_at: new Date(),
      completed_at: null,
    });

    return session.get({ plain: true });
  }

  async list(
    filters: SessionListFilters,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSessionAttributes>> {
    const result = await this.unitOfWork.runtimeSessions.findWithFilters(
      filters,
      pagination,
    );

    return {
      data: result.data.map((s) => s.get({ plain: true })),
      pagination: result.pagination,
    };
  }

  async complete(
    id: string,
    outputs?: Record<string, unknown>,
  ): Promise<RuntimeSessionAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(id);
    if (!session) throw new NotFoundError("RuntimeSession", id);

    if (session.status === "completed") {
      throw new BusinessRuleError("Session is already completed");
    }
    if (session.status === "cancelled") {
      throw new BusinessRuleError("Cannot complete a cancelled session");
    }

    const completed = await this.unitOfWork.runtimeSessions.completeSession(
      id,
      outputs,
    );
    return completed.get({ plain: true });
  }

  async fail(id: string, error?: string): Promise<RuntimeSessionAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(id);
    if (!session) throw new NotFoundError("RuntimeSession", id);

    if (session.status === "completed") {
      throw new BusinessRuleError("Cannot fail a completed session");
    }
    if (session.status === "cancelled") {
      throw new BusinessRuleError("Cannot fail a cancelled session");
    }

    const failed = await this.unitOfWork.runtimeSessions.failSession(id, error);
    return failed.get({ plain: true });
  }

  async cancel(id: string): Promise<RuntimeSessionAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(id);
    if (!session) throw new NotFoundError("RuntimeSession", id);

    const cancelled = await this.unitOfWork.runtimeSessions.cancelSession(id);
    return cancelled.get({ plain: true });
  }

  async updateVariables(
    id: string,
    variables: Record<string, unknown>,
  ): Promise<RuntimeSessionAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(id);
    if (!session) throw new NotFoundError("RuntimeSession", id);

    if (session.status === "completed" || session.status === "cancelled") {
      throw new BusinessRuleError(
        "Cannot update variables for a completed or cancelled session",
      );
    }

    const updated = await this.unitOfWork.runtimeSessions.updateVariables(
      id,
      variables,
    );
    return updated.get({ plain: true });
  }

  async updateOutputs(
    id: string,
    outputs: Record<string, unknown>,
  ): Promise<RuntimeSessionAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(id);
    if (!session) throw new NotFoundError("RuntimeSession", id);

    const updated = await this.unitOfWork.runtimeSessions.updateOutputs(
      id,
      outputs,
    );
    return updated.get({ plain: true });
  }

  async delete(id: string): Promise<void> {
    const session = await this.unitOfWork.runtimeSessions.findById(id);
    if (!session) throw new NotFoundError("RuntimeSession", id);

    if (session.status === "running") {
      throw new BusinessRuleError(
        "Cannot delete a running session. Cancel it first.",
      );
    }

    await this.unitOfWork.withTransaction(async (uow) => {
      await uow.nodeExecutions.deleteBySessionId(
        id,
        uow.transaction ?? undefined,
      );
      await uow.chatMessages.deleteBySessionId(
        id,
        uow.transaction ?? undefined,
      );
      await uow.runtimeSessions.delete(id, uow.transaction ?? undefined);
    });
  }

  async getSessionStats(id: string): Promise<{
    session: RuntimeSessionAttributes;
    executionStats: {
      totalExecutions: number;
      successfulExecutions: number;
      failedExecutions: number;
      averageExecutionTime: number;
      totalExecutionTime: number;
    };
  }> {
    const session = await this.unitOfWork.runtimeSessions.findById(id);
    if (!session) throw new NotFoundError("RuntimeSession", id);

    const executionStats =
      await this.unitOfWork.nodeExecutions.getSessionExecutionStats(id);

    return {
      session: session.get({ plain: true }),
      executionStats,
    };
  }
}
