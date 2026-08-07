import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { IUnitOfWork } from "@server/storage/unit-of-work";
import { BusinessRuleError, NotFoundError } from "@server/utils/errors";
import { NodeExecutionAttributes } from "@shared/schemas/chat.schema";

export interface CreateNodeExecutionDTO {
  sessionId: string;
  nodeId: string;
  nodeType: string;
  inputs?: Record<string, unknown>;
}

export interface UpdateNodeExecutionDTO {
  outputs?: Record<string, unknown>;
  executionTime?: number;
  status?: string;
  error?: string;
}

export interface NodeExecutionListFilters {
  sessionId?: string;
  nodeId?: string;
  nodeType?: string;
  status?: string;
}

export interface INodeExecutionService {
  getById(id: number): Promise<NodeExecutionAttributes>;
  getBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecutionAttributes>>;
  list(
    filters: NodeExecutionListFilters,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecutionAttributes>>;
  create(data: CreateNodeExecutionDTO): Promise<NodeExecutionAttributes>;
  update(
    id: number,
    data: UpdateNodeExecutionDTO,
  ): Promise<NodeExecutionAttributes>;
  completeExecution(
    id: number,
    outputs: Record<string, unknown>,
    executionTime: number,
  ): Promise<NodeExecutionAttributes>;
  failExecution(
    id: number,
    error: string,
    executionTime?: number,
  ): Promise<NodeExecutionAttributes>;
  delete(id: number): Promise<void>;
  deleteBySessionId(sessionId: string): Promise<void>;
  getSessionExecutionStats(sessionId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  }>;
}

export class NodeExecutionService implements INodeExecutionService {
  private readonly unitOfWork: IUnitOfWork;

  constructor(unitOfWork: IUnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  async getById(id: number): Promise<NodeExecutionAttributes> {
    const execution = await this.unitOfWork.nodeExecutions.findById(id, {
      include: ["session"],
    });
    if (!execution) throw new NotFoundError("NodeExecution", id);
    return execution.get({ plain: true });
  }

  async getBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecutionAttributes>> {
    const session = await this.unitOfWork.runtimeSessions.findById(sessionId);
    if (!session) throw new NotFoundError("RuntimeSession", sessionId);

    const result = await this.unitOfWork.nodeExecutions.findBySessionId(
      sessionId,
      pagination,
    );

    return {
      data: result.data.map((e) => e.get({ plain: true })),
      pagination: result.pagination,
    };
  }

  async list(
    filters: NodeExecutionListFilters,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecutionAttributes>> {
    const result = await this.unitOfWork.nodeExecutions.findWithFilters(
      filters,
      pagination,
    );

    return {
      data: result.data.map((e) => e.get({ plain: true })),
      pagination: result.pagination,
    };
  }

  async create(
    data: CreateNodeExecutionDTO,
  ): Promise<NodeExecutionAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(
      data.sessionId,
    );
    if (!session) throw new NotFoundError("RuntimeSession", data.sessionId);

    if (
      session.status === "completed" ||
      session.status === "cancelled" ||
      session.status === "failed"
    ) {
      throw new BusinessRuleError(
        "Cannot create node execution for a non-active session",
      );
    }

    if (session.status === "pending") {
      await this.unitOfWork.runtimeSessions.updateStatus(
        data.sessionId,
        "running",
      );
    }

    const execution = await this.unitOfWork.nodeExecutions.createExecution({
      session_id: data.sessionId,
      node_id: data.nodeId,
      node_type: data.nodeType,
      inputs: data.inputs || null,
      outputs: null,
      execution_time: null,
      status: "running",
      error: null,
      timestamp: new Date(),
    });

    return execution.get({ plain: true });
  }

  async update(
    id: number,
    data: UpdateNodeExecutionDTO,
  ): Promise<NodeExecutionAttributes> {
    const execution = await this.unitOfWork.nodeExecutions.findById(id);
    if (!execution) throw new NotFoundError("NodeExecution", id);

    if (data.status === "success" && data.outputs) {
      return this.completeExecution(
        id,
        data.outputs,
        data.executionTime || 0,
      );
    }

    if (data.status === "failed" && data.error) {
      return this.failExecution(id, data.error, data.executionTime);
    }

    const updateData: Record<string, unknown> = {};
    if (data.outputs !== undefined) updateData.outputs = data.outputs;
    if (data.executionTime !== undefined)
      updateData.execution_time = data.executionTime;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.error !== undefined) updateData.error = data.error;

    const updated = await this.unitOfWork.nodeExecutions.update(id, updateData);
    if (!updated) throw new NotFoundError("NodeExecution", id);
    return updated.get({ plain: true });
  }

  async completeExecution(
    id: number,
    outputs: Record<string, unknown>,
    executionTime: number,
  ): Promise<NodeExecutionAttributes> {
    const execution = await this.unitOfWork.nodeExecutions.findById(id);
    if (!execution) throw new NotFoundError("NodeExecution", id);

    if (execution.status === "success") {
      throw new BusinessRuleError(
        "Node execution is already completed successfully",
      );
    }

    const completed =
      await this.unitOfWork.nodeExecutions.updateExecutionResult(
        id,
        outputs,
        executionTime,
        "success",
      );

    return completed.get({ plain: true });
  }

  async failExecution(
    id: number,
    error: string,
    executionTime?: number,
  ): Promise<NodeExecutionAttributes> {
    const execution = await this.unitOfWork.nodeExecutions.findById(id);
    if (!execution) throw new NotFoundError("NodeExecution", id);

    const failed = await this.unitOfWork.nodeExecutions.failExecution(
      id,
      error,
      executionTime,
    );

    return failed.get({ plain: true });
  }

  async delete(id: number): Promise<void> {
    const execution = await this.unitOfWork.nodeExecutions.findById(id);
    if (!execution) throw new NotFoundError("NodeExecution", id);
    await this.unitOfWork.nodeExecutions.delete(id);
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    const session = await this.unitOfWork.runtimeSessions.findById(sessionId);
    if (!session) throw new NotFoundError("RuntimeSession", sessionId);
    await this.unitOfWork.nodeExecutions.deleteBySessionId(sessionId);
  }

  async getSessionExecutionStats(sessionId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  }> {
    const session = await this.unitOfWork.runtimeSessions.findById(sessionId);
    if (!session) throw new NotFoundError("RuntimeSession", sessionId);
    return this.unitOfWork.nodeExecutions.getSessionExecutionStats(sessionId);
  }
}
