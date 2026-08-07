import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { IUnitOfWork } from "@server/storage/unit-of-work";
import { BusinessRuleError, NotFoundError } from "@server/utils/errors";
import { FlowVersionAttributes } from "@shared/types";
import { randomUUID } from "crypto";

export interface CreateVersionDTO {
  flowId: number;
  data?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  author: string;
  comment?: string;
}

export interface IFlowVersionService {
  getByFlowId(
    flowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<FlowVersionAttributes>>;
  getLatestVersion(flowId: number): Promise<FlowVersionAttributes>;
  getByVersionNumber(
    flowId: number,
    versionNumber: number,
  ): Promise<FlowVersionAttributes>;
  getById(id: string): Promise<FlowVersionAttributes>;
  create(data: CreateVersionDTO): Promise<FlowVersionAttributes>;
  delete(id: string): Promise<void>;
  deleteByFlowId(flowId: number): Promise<void>;
  restoreVersion(
    versionId: string,
  ): Promise<{ flowId: number; restoredData: Record<string, unknown> }>;
}

export class FlowVersionService implements IFlowVersionService {
  private readonly unitOfWork: IUnitOfWork;

  constructor(unitOfWork: IUnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  async getByFlowId(
    flowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<FlowVersionAttributes>> {
    const flow = await this.unitOfWork.chatFlows.findById(flowId);
    if (!flow) throw new NotFoundError("ChatFlow", flowId);

    const result = await this.unitOfWork.flowVersions.findByFlowId(
      flowId,
      pagination,
    );

    return {
      data: result.data.map((v) => v.get({ plain: true })),
      pagination: result.pagination,
    };
  }

  async getLatestVersion(flowId: number): Promise<FlowVersionAttributes> {
    const flow = await this.unitOfWork.chatFlows.findById(flowId);
    if (!flow) throw new NotFoundError("ChatFlow", flowId);

    const version = await this.unitOfWork.flowVersions.findLatestVersion(flowId);
    if (!version) {
      throw new NotFoundError("FlowVersion", `latest for flow ${flowId}`);
    }

    return version.get({ plain: true });
  }

  async getByVersionNumber(
    flowId: number,
    versionNumber: number,
  ): Promise<FlowVersionAttributes> {
    const version = await this.unitOfWork.flowVersions.findByVersionNumber(
      flowId,
      versionNumber,
    );
    if (!version) {
      throw new NotFoundError(
        "FlowVersion",
        `${versionNumber} for flow ${flowId}`,
      );
    }

    return version.get({ plain: true });
  }

  async getById(id: string): Promise<FlowVersionAttributes> {
    const version = await this.unitOfWork.flowVersions.findById(id, {
      include: ["chatFlow"],
    });
    if (!version) throw new NotFoundError("FlowVersion", id);
    return version.get({ plain: true });
  }

  async create(data: CreateVersionDTO): Promise<FlowVersionAttributes> {
    const flow = await this.unitOfWork.chatFlows.findById(data.flowId);
    if (!flow) throw new NotFoundError("ChatFlow", data.flowId);

    const nextVersionNumber =
      await this.unitOfWork.flowVersions.getNextVersionNumber(data.flowId);

    const version = await this.unitOfWork.flowVersions.createVersion({
      id: randomUUID(),
      flow_id: data.flowId,
      data: data.data || flow.flow_data,
      inputs: data.inputs || null,
      author: data.author,
      comment: data.comment || null,
      version_number: nextVersionNumber,
    });

    return version.get({ plain: true });
  }

  async delete(id: string): Promise<void> {
    const version = await this.unitOfWork.flowVersions.findById(id);
    if (!version) throw new NotFoundError("FlowVersion", id);

    const latest = await this.unitOfWork.flowVersions.findLatestVersion(
      version.flow_id,
    );
    if (latest?.id === id) {
      throw new BusinessRuleError(
        "Cannot delete the latest version. Create a new version first.",
      );
    }

    await this.unitOfWork.flowVersions.delete(id);
  }

  async deleteByFlowId(flowId: number): Promise<void> {
    const flow = await this.unitOfWork.chatFlows.findById(flowId);
    if (!flow) throw new NotFoundError("ChatFlow", flowId);
    await this.unitOfWork.flowVersions.deleteByFlowId(flowId);
  }

  async restoreVersion(
    versionId: string,
  ): Promise<{ flowId: number; restoredData: Record<string, unknown> }> {
    const version = await this.unitOfWork.flowVersions.findById(versionId);
    if (!version) throw new NotFoundError("FlowVersion", versionId);

    await this.unitOfWork.chatFlows.updateFlowData(
      version.flow_id,
      version.data,
    );

    return {
      flowId: version.flow_id,
      restoredData: version.data,
    };
  }
}
