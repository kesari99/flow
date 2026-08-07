import {
  createPaginationResult,
  getPaginationOptions,
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { NotFoundError } from "@server/utils/errors";
import {
  CreationAttributes,
  FindOptions,
  Model,
  ModelStatic,
  Order,
  Transaction,
  WhereOptions,
} from "sequelize";
import { MakeNullishOptional } from "sequelize/lib/utils";

export interface IBaseRepository<T extends Model> {
  findById(id: string | number, options?: FindOptions<T>): Promise<T>;
  findOne(options: FindOptions): Promise<T>;
  findAll(options?: FindOptions): Promise<T[]>;
  findAndCountAll(
    pagination: PaginationOptions,
    where: WhereOptions<T["_attributes"]>,
  ): Promise<PaginationResult<T>>;
  create(
    data: CreationAttributes<T>,
    transaction?: Transaction,
  ): Promise<T>;
  bulkCreate(
    data: CreationAttributes<T>[],
    transaction?: Transaction,
  ): Promise<T[]>;
  update(
    id: string | number,
    data: Partial<CreationAttributes<T>>,
    transaction?: Transaction,
  ): Promise<T | null>;
  delete(id: string | number, transaction?: Transaction): Promise<boolean>;
  exists(where: WhereOptions<T["_attributes"]>): Promise<boolean>;
  count(where?: WhereOptions<T["_attributes"]>): Promise<number>;
}

export abstract class BaseRepository<
  T extends Model,
> implements IBaseRepository<T> {
  protected readonly model: ModelStatic<T>;
  protected readonly resourceName: string;

  constructor(model: ModelStatic<T>, resourceName: string) {
    this.model = model;
    this.resourceName = resourceName;
  }

  async findById(
    id: string | number,
    options?: FindOptions<T> | undefined,
  ): Promise<T> {
    return this.model.findByPk(id, options) as Promise<T>;
  }

  async findOne(options: FindOptions): Promise<T> {
    return this.model.findOne(options) as Promise<T>;
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll(options) as Promise<T[]>;
  }

  async findAndCountAll(
    pagination: PaginationOptions,
    where: WhereOptions<T["_attributes"]>,
    include?: FindOptions<T>["include"],
  ): Promise<PaginationResult<T>> {
    const { page, limit, offset, sortBy, sortOrder } =
      getPaginationOptions(pagination);
    const order: Order = [[sortBy, sortOrder]];

    const { rows, count } = await this.model.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true,
    });

    return createPaginationResult(rows as T[], count, page, limit);
  }

  async create(
    data: MakeNullishOptional<T["_creationAttributes"]>,
    transaction?: Transaction,
  ): Promise<T> {
    return this.model.create(data, { transaction }) as Promise<T>;
  }

  async bulkCreate(
    data: MakeNullishOptional<T["_creationAttributes"]>[],
    transaction?: Transaction,
  ): Promise<T[]> {
    return this.model.bulkCreate(data, { transaction }) as Promise<T[]>;
  }

  async update(
    id: string | number,
    data: Partial<CreationAttributes<T>>,
    transaction?: Transaction,
  ): Promise<T | null> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundError(this.resourceName, id);
    }

    await instance.update(data as Partial<T>, { transaction });
    return instance.reload({ transaction });
  }

  async delete(
    id: string | number,
    transaction?: Transaction,
  ): Promise<boolean> {
    const instance = this.findById(id);
    if (!instance) {
      throw new NotFoundError(this.resourceName, id);
    }

    (await instance).destroy({ transaction });
    return true;
  }
  async exists(where: WhereOptions<T["_attributes"]>): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async count(
    where?: WhereOptions<T["_attributes"]> | undefined,
  ): Promise<number> {
    return this.model.count({ where });
  }
}
