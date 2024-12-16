import {
  Inject,
  Injectable,
  OnApplicationShutdown,
} from "@nestjs/common";
import {
  DataSource,
  DeleteResult,
  EntityMetadata,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  QueryRunner,
  SelectQueryBuilder,
} from "typeorm";
import { Repository } from "typeorm/repository/Repository";
import { EntityManager } from "typeorm/entity-manager/EntityManager";
import { BaseEntity } from "./baseEntities/base";
import { UpdateResult } from "typeorm/query-builder/result/UpdateResult";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DeepPartial } from "typeorm/common/DeepPartial";
import { Logger } from "../logger/logger";

@Injectable()
export class MysqlService implements OnApplicationShutdown {
  logger = new Logger(MysqlService.name);
  onApplicationShutdown() {
    this.logger.info("Application Showdown; Mysql Close");
    if (this.connection?.destroy) {
      this.connection.destroy();
    }
  }

  constructor(@Inject("MYSQL_CONNECTION") readonly connection: DataSource) {}

  GetModel<T extends BaseEntity>(entity: new () => T): Repository<T> {
    return this.connection.getRepository(entity);
  }

  getMetadata<T extends BaseEntity>(target: EntityTarget<T>): EntityMetadata {
    return this.connection.getMetadata(target);
  }

  getTableName<T extends BaseEntity>(target: EntityTarget<T>): string {
    return this.getMetadata(target).tableName;
  }

  GetManager(): EntityManager {
    return this.connection.manager;
  }

  public create<T extends BaseEntity>(entity: EntityTarget<T>, options?: DeepPartial<T>): T {
    return this.GetManager().create(entity, options);
  }

  public async save<T extends BaseEntity>(entity: T): Promise<T> {
    return this.GetManager().save(entity);
  }

  // 提供简单的API
  public async findOne<T extends BaseEntity>(entity: new () => T, options: FindOneOptions<T>): Promise<T> {
    return this.GetManager().findOne(entity, options);
  }

  async findOneBy<T>(entity: new () => T, options: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T> {
    return this.GetManager().findOneBy(entity, options);
  }

  public async find<T extends BaseEntity>(entity: new () => T, options: FindManyOptions<T>): Promise<T[]> {
    return this.GetManager().find(entity, options);
  }

  public async update<T extends BaseEntity>(
    entity: new () => T,
    options: any,
    partEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.GetManager().update(entity, options, partEntity);
  }

  async remove<T>(entity: T, options: any): Promise<T> {
    return this.GetManager().remove(entity, options);
  }

  async delete<T extends BaseEntity>(entity: new () => T, options: FindOneOptions<T>): Promise<DeleteResult> {
    return this.GetManager().delete(entity, options);
  }

  async softDelete<T extends BaseEntity>(entity: new () => T, options: FindOneOptions<T>): Promise<UpdateResult> {
    return this.GetManager().softDelete(entity, options);
  }

  CreateQueryBuilder<T extends BaseEntity>(
    entity: EntityTarget<T>,
    alias: string,
    queryRunner?: QueryRunner,
  ): SelectQueryBuilder<T> {
    return this.GetManager().createQueryBuilder(entity, alias, queryRunner);
  }
}
