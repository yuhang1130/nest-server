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
  MongoEntityManager,
  MongoRepository,
  QueryRunner,
  SelectQueryBuilder,
} from "typeorm";
import { SessionDto } from "../middleware/session-store/session-dto";
import { BaseEntity } from "./baseEntities/base";
import { UpdateResult } from "typeorm/query-builder/result/UpdateResult";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DeepPartial } from "typeorm/common/DeepPartial";
import { Logger } from "../logger/logger";

@Injectable()
export class Mongo implements OnApplicationShutdown {
  logger = new Logger(Mongo.name);
  onApplicationShutdown() {
    this.logger.info("Application Showdown; Mongo Close");
    if (this.connection?.destroy) {
      this.connection.destroy();
    }
  }

  constructor(@Inject("MONGO_CONNECTION") readonly connection: DataSource) {}

  GetModel<T extends BaseEntity>(entity: new () => T): MongoRepository<T> {
    return this.connection.getMongoRepository(entity);
  }

  getMetadata<T extends BaseEntity>(target: EntityTarget<T>): EntityMetadata {
    return this.connection.getMetadata(target);
  }

  getTableName<T extends BaseEntity>(target: EntityTarget<T>): string {
    return this.getMetadata(target).tableName;
  }

  GetManager(): MongoEntityManager {
    return this.connection.mongoManager;
  }

  public create<T extends BaseEntity>(entity: EntityTarget<T>, options?: DeepPartial<T>): T {
    return this.GetManager().create(entity, options);
  }

  public async save<T extends BaseEntity>(entity: T, UserSession?: SessionDto): Promise<T> {
    const isNew = !entity.id;
    if (UserSession) {
      if (isNew) {
        entity.createUserId = UserSession.OpUserId || UserSession.UserId;
      } else {
        entity.updateUserId = UserSession.OpUserId || UserSession.UserId;
      }
    }

    return this.GetManager().save(entity);
  }

  // 提供简单的API
  public async findOne<T extends BaseEntity>(entity: new () => T, options: FindOneOptions<T>): Promise<T> {
    return this.GetManager().findOne(entity, options);
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

  async delete<T extends BaseEntity>(entity: new () => T, options: any): Promise<DeleteResult> {
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
