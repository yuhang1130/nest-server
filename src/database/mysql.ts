import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Connection, EntityMetadata, EntityTarget, FindManyOptions, FindOneOptions, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { SessionDto } from '../middleware/session-store/session-dto';
import { Repository } from 'typeorm/repository/Repository';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { BaseEntity } from './baseEntities/base';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DeepPartial } from 'typeorm/common/DeepPartial';

@Injectable()
export class Mysql implements OnApplicationShutdown {
	logger = new Logger(Mysql.name);
	onApplicationShutdown() {
		this.logger.log('Application Showdown; Mysql Close');
		if (this?.connection && this?.connection?.close) {
			this.connection.close();
		}
	}

	constructor(@Inject('MYSQL_CONNECTION') readonly connection: Connection) {}

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
		const manager = this.GetManager();
		return manager.create(entity, options);
	}

	public async save<T extends BaseEntity>(entity: T, UserSession?: SessionDto): Promise<T> {
		const isNew = !entity.id;
		if (UserSession) {
			if (isNew) {
				entity.create_user_id = UserSession.OpUserId || UserSession.UserId;
			} else {
				entity.update_user_id = UserSession.OpUserId || UserSession.UserId;
			}
		}

		const manager = this.GetManager();
		return manager.save(entity);
	}

	// 提供简单的API
	public async findOne<T extends BaseEntity>(entity: new () => T, options: FindOneOptions<T>): Promise<T> {
		const manager = this.GetManager();
		return manager.findOne(entity, options);
	}

	public async find<T extends BaseEntity>(entity: new () => T, options: FindManyOptions<T>): Promise<T[]> {
		const manager = this.GetManager();
		return manager.find(entity, options);
	}

	public async update<T extends BaseEntity>(
		entity: new () => T,
		options: any,
		partEntity: QueryDeepPartialEntity<T>,
	): Promise<UpdateResult> {
		const manager = this.GetManager();
		return manager.update(entity, options, partEntity);
	}

	async remove<T>(entity: T): Promise<T> {
		const manager = this.GetManager();
		return manager.remove(entity);
	}

	CreateQueryBuilder<T extends BaseEntity>(entity: EntityTarget<T>, alias: string, queryRunner?: QueryRunner): SelectQueryBuilder<T> {
    const manager = this.GetManager();
    return manager.createQueryBuilder(entity, alias, queryRunner);
  }
}
