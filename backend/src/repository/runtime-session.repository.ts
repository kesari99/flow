import { RuntimeSession } from "@server/models/runtime-session.model";
import { BaseRepository, IBaseRepository } from ".";
import {
  RuntimeSessionCreationAttributes,
  RuntimeSessionStatus,
} from "@shared/types";
import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { Op, Transaction, WhereOptions } from "sequelize";
import { NotFoundError } from "@server/utils/errors";
export interface SessionFilterOptions {
  flowId?: number;
  userId?: string;
  status?: RuntimeSessionStatus | RuntimeSessionStatus[];
  startDate?: Date;
  endDate?: Date;
}

export interface IRuntimeSessionRepository extends IBaseRepository<RuntimeSession> {
  findByFlowId(
    flowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>>;
  findByUserId(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>>;
  findWithFilters(
    filters: SessionFilterOptions,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>>;
  findByStatus(
    status: RuntimeSessionStatus,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>>;
  findActiveSessions(): Promise<RuntimeSession[]>;
  //   findStaleSessions(staleThreshold: Date): Promise<RuntimeSession[]>;
  createSession(
    data: RuntimeSessionCreationAttributes,
    transaction?: Transaction,
  ): Promise<RuntimeSession>;
  updateStatus(
    id: string,
    status: RuntimeSessionStatus,
    transaction?: Transaction,
  ): Promise<RuntimeSession>;
  completeSession(
    id: string,
    outputs?: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<RuntimeSession>;
  failSession(
    id: string,
    error?: string,
    transaction?: Transaction,
  ): Promise<RuntimeSession>;
  cancelSession(id: string, transaction?: Transaction): Promise<RuntimeSession>;
  updateVariables(
    id: string,
    variables: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<RuntimeSession>;
  updateOutputs(
    id: string,
    outputs: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<RuntimeSession>;
  deleteByFlowId(flowId: number, transaction?: Transaction): Promise<number>;
  deleteByUserId(userId: string, transaction?: Transaction): Promise<number>;
}

export class RuntimeSessionRepository
  extends BaseRepository<RuntimeSession>
  implements IRuntimeSessionRepository
{
  constructor() {
    super(RuntimeSession, "RuntimeSession");
  }

  async findByFlowId(
    flowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>> {
    return this.findAndCountAll(pagination, { flow_id: flowId });
  }

  async findByUserId(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>> {
    return this.findAndCountAll(pagination, { user_id: userId });
  }

  async findWithFilters(
    filters: SessionFilterOptions,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>> {
    const where: WhereOptions<RuntimeSession["_attributes"]> = {};

    if (filters.flowId !== undefined) {
      where.flow_id = filters.flowId;
    }
    if (filters.userId !== undefined) {
      where.user_id = filters.userId;
    }
    if (filters.status !== undefined) {
      where.status = Array.isArray(filters.status)
        ? { [Op.in]: filters.status }
        : filters.status;
    }
    if (filters.startDate || filters.endDate) {
      where.started_at = {
        ...(filters.startDate ? { [Op.gte]: filters.startDate } : {}),
        ...(filters.endDate ? { [Op.lte]: filters.endDate } : {}),
      };
    }

    return this.findAndCountAll(pagination, where);
  }

  async findByStatus(
    status: RuntimeSessionStatus,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<RuntimeSession>> {
    return this.findAndCountAll(pagination, { status });
  }

  async findActiveSessions(): Promise<RuntimeSession[]> {
    return this.findAll({
      where: { status: { [Op.in]: ["pending", "running"] } },
    });
  }

  async createSession(
    data: RuntimeSessionCreationAttributes,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    return this.model.create(data, { transaction });
  }

  async updateStatus(
    id: string,
    status: RuntimeSessionStatus,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    return this.applyUpdate(id, { status }, transaction);
  }

  async completeSession(
    id: string,
    outputs?: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    return this.applyUpdate(
      id,
      {
        status: "completed",
        completed_at: new Date(),
        ...(outputs ? { outputs } : {}),
      },
      transaction,
    );
  }

  async failSession(
    id: string,
    error?: string,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    return this.applyUpdate(
      id,
      {
        status: "failed",
        completed_at: new Date(),
        ...(error ? { metadata: { error } } : {}),
      },
      transaction,
    );
  }

  async cancelSession(
    id: string,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    return this.applyUpdate(
      id,
      { status: "cancelled", completed_at: new Date() },
      transaction,
    );
  }

  async updateVariables(
    id: string,
    variables: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    return this.applyUpdate(id, { variables }, transaction);
  }

  async updateOutputs(
    id: string,
    outputs: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    return this.applyUpdate(id, { outputs }, transaction);
  }

  async deleteByFlowId(
    flowId: number,
    transaction?: Transaction,
  ): Promise<number> {
    return this.model.destroy({ where: { flow_id: flowId }, transaction });
  }

  async deleteByUserId(
    userId: string,
    transaction?: Transaction,
  ): Promise<number> {
    return this.model.destroy({ where: { user_id: userId }, transaction });
  }

  private async applyUpdate(
    id: string,
    data: Partial<RuntimeSession["_attributes"]>,
    transaction?: Transaction,
  ): Promise<RuntimeSession> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundError(this.resourceName, id);
    }

    await instance.update(data, { transaction });
    return instance.reload({ transaction });
  }
}
