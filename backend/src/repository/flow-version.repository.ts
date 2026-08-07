import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { FlowVersion } from "@server/models/flow-version.model";
import { FlowVersionCreationAttributes } from "@shared/types";
import { Transaction } from "sequelize";
import { BaseRepository, IBaseRepository } from ".";

export interface IFlowVersionRepository extends IBaseRepository<FlowVersion> {
  createVersion(
    data: FlowVersionCreationAttributes,
    transaction?: Transaction,
  ): Promise<FlowVersion>;
  findByFlowId(
    flowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<FlowVersion>>;
  findLatestVersion(flowId: number): Promise<FlowVersion | null>;
  findByVersionNumber(
    flowId: number,
    versionNumber: number,
  ): Promise<FlowVersion | null>;
  getNextVersionNumber(flowId: number): Promise<number>;
  deleteByFlowId(flowId: number, transaction?: Transaction): Promise<number>;
  getFlowVersionCount(flowId: number): Promise<number>;
}

export class FlowVersionRepository
  extends BaseRepository<FlowVersion>
  implements IFlowVersionRepository
{
  constructor() {
    super(FlowVersion, "FlowVersion");
  }

  async createVersion(
    data: FlowVersionCreationAttributes,
    transaction?: Transaction,
  ): Promise<FlowVersion> {
    return this.model.create(data, { transaction });
  }

  async findByFlowId(
    flowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<FlowVersion>> {
    return this.findAndCountAll(pagination, { flow_id: flowId });
  }

  async findLatestVersion(flowId: number): Promise<FlowVersion | null> {
    return this.model.findOne({
      where: { flow_id: flowId },
      order: [["version_number", "DESC"]],
    });
  }

  async findByVersionNumber(
    flowId: number,
    versionNumber: number,
  ): Promise<FlowVersion | null> {
    return this.model.findOne({
      where: { flow_id: flowId, version_number: versionNumber },
    });
  }

  async getNextVersionNumber(flowId: number): Promise<number> {
    const latest = await this.findLatestVersion(flowId);
    return latest ? latest.version_number + 1 : 1;
  }

  async deleteByFlowId(
    flowId: number,
    transaction?: Transaction,
  ): Promise<number> {
    return this.model.destroy({
      where: { flow_id: flowId },
      transaction,
    });
  }

  async getFlowVersionCount(flowId: number): Promise<number> {
    return this.count({ flow_id: flowId });
  }
}
