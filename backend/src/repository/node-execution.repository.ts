import { NodeExecution } from "@server/models/node-execution.model";
import { BaseRepository, IBaseRepository } from ".";
import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { NodeExecutionCreationAttributes } from "@shared/types";
import { Transaction, WhereOptions } from "sequelize";
import { NotFoundError } from "@server/utils/errors";

export interface NodeExecutionFilterOptions {
  sessionId?: string;
  nodeId?: string;
  nodeType?: string;
  status?: string;
}

export interface INodeExecutionRepository extends IBaseRepository<NodeExecution> {
  findBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecution>>;
  findByNodeId(sessionId: string, nodeId: string): Promise<NodeExecution[]>;
  findLatestBySessionId(sessionId: string): Promise<NodeExecution | null>;
  findWithFilters(
    filters: NodeExecutionFilterOptions,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecution>>;
  createExecution(
    data: NodeExecutionCreationAttributes,
    transaction?: Transaction,
  ): Promise<NodeExecution>;
  updateExecutionResult(
    id: number,
    outputs: Record<string, unknown>,
    executionTime: number,
    status: string,
    transaction?: Transaction,
  ): Promise<NodeExecution>;
  failExecution(
    id: number,
    error: string,
    executionTime?: number,
    transaction?: Transaction,
  ): Promise<NodeExecution>;
  deleteBySessionId(
    sessionId: string,
    transaction?: Transaction,
  ): Promise<number>;
  getSessionExecutionStats(sessionId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  }>;
}

export class NodeExecutionRepository
  extends BaseRepository<NodeExecution>
  implements INodeExecutionRepository
{
  constructor() {
    super(NodeExecution, "NodeExecution");
  }

  async findBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecution>> {
    return this.findAndCountAll(pagination, { session_id: sessionId });
  }

  async findByNodeId(
    sessionId: string,
    nodeId: string,
  ): Promise<NodeExecution[]> {
    return this.findAll({
      where: { session_id: sessionId, node_id: nodeId },
    });
  }

  async findLatestBySessionId(
    sessionId: string,
  ): Promise<NodeExecution | null> {
    return this.model.findOne({
      where: { session_id: sessionId },
      order: [["timestamp", "DESC"]],
    });
  }

  async findWithFilters(
    filters: NodeExecutionFilterOptions,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<NodeExecution>> {
    const where: WhereOptions<NodeExecution["_attributes"]> = {};

    if (filters.sessionId !== undefined) {
      where.session_id = filters.sessionId;
    }
    if (filters.nodeId !== undefined) {
      where.node_id = filters.nodeId;
    }
    if (filters.nodeType !== undefined) {
      where.node_type = filters.nodeType;
    }
    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    return this.findAndCountAll(pagination, where);
  }

  async createExecution(
    data: NodeExecutionCreationAttributes,
    transaction?: Transaction,
  ): Promise<NodeExecution> {
    return this.model.create(data, { transaction });
  }

  async updateExecutionResult(
    id: number,
    outputs: Record<string, unknown>,
    executionTime: number,
    status: string,
    transaction?: Transaction,
  ): Promise<NodeExecution> {
    return this.applyUpdate(
      id,
      { outputs, execution_time: executionTime, status },
      transaction,
    );
  }

  async failExecution(
    id: number,
    error: string,
    executionTime?: number,
    transaction?: Transaction,
  ): Promise<NodeExecution> {
    return this.applyUpdate(
      id,
      {
        status: "failed",
        error,
        ...(executionTime !== undefined
          ? { execution_time: executionTime }
          : {}),
      },
      transaction,
    );
  }

  async deleteBySessionId(
    sessionId: string,
    transaction?: Transaction,
  ): Promise<number> {
    return this.model.destroy({
      where: { session_id: sessionId },
      transaction,
    });
  }

  async getSessionExecutionStats(sessionId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  }> {
    const executions = await this.findAll({
      where: { session_id: sessionId },
    });

    const totalExecutions = executions.length;
    let failedExecutions = 0;
    let totalExecutionTime = 0;

    for (const execution of executions) {
      if (execution.status === "failed") {
        failedExecutions += 1;
      }
      totalExecutionTime += execution.execution_time ?? 0;
    }

    const successfulExecutions = totalExecutions - failedExecutions;
    const averageExecutionTime =
      totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      totalExecutionTime,
    };
  }

  private async applyUpdate(
    id: number,
    data: Partial<NodeExecution["_attributes"]>,
    transaction?: Transaction,
  ): Promise<NodeExecution> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundError(this.resourceName, id);
    }

    await instance.update(data, { transaction });
    return instance.reload({ transaction });
  }
}
