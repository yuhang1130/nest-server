import { Logger } from "../logger/logger";
import { IdCounter } from "../utils/IdCounter";
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RecoverEvent, RemoveEvent, SoftRemoveEvent, TransactionCommitEvent, TransactionRollbackEvent, TransactionStartEvent, UpdateEvent } from "typeorm"
import * as dayjs from "dayjs";
import { AlsGetUserSession } from "../async-storage/async-storage";
import { Inject } from "@nestjs/common";



@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface {
  logger = new Logger(EntitySubscriber.name);

  constructor(
    @Inject('MYSQL_CONNECTION') readonly connection: DataSource,
    @Inject('MONGO_CONNECTION') readonly mongo_connection: DataSource,
    private readonly idCounter: IdCounter,
  ) {
    connection.subscribers.push(this);
    mongo_connection.subscribers.push(this);
  }

    /**
     * 在插入 post 之前调用。
     */
    async beforeInsert(event: InsertEvent<any>) {
      console.log(`BEFORE ENTITY INSERTED: `, event.entity)
      const now = dayjs().unix();
      event.entity.createdAt = event.entity.createdAt || now;
      event.entity.updatedAt = now;
      event.entity.createdBy = AlsGetUserSession()?.OpUserId || 0;
      if (!event.entity.id) {
        event.entity.id = await this.idCounter.getIncrementId(event.metadata.tableName);
      }
    }

    /**
     * 在实体插入后调用。
     */
    async afterInsert(event: InsertEvent<any>) {
      // TODO 可以做一些通知操作
      console.log(`AFTER ENTITY INSERTED: `, event.entity)
    }

    /**
     * 在实体更新之前调用。
     */
    async beforeUpdate(event: UpdateEvent<any>) {
      console.log(`BEFORE ENTITY UPDATED: `, event.entity)
      event.entity.updatedAt = dayjs().unix();
      event.entity.updatedBy = AlsGetUserSession()?.OpUserId || 0;
    }

    /**
     * 在实体更新后调用。
     */
    async afterUpdate(event: UpdateEvent<any>) {
        // TODO 可以做一些通知操作
        console.log(`AFTER ENTITY UPDATED: `, event.entity)
    }

    /**
     * 在实体删除之前调用。
     */
    async beforeRemove(event: RemoveEvent<any>) {
        // TODO 可以做一些通知操作
        console.log(
            `BEFORE ENTITY WITH ID ${event.entityId} REMOVED: `,
            event.entity,
        )
    }

    /**
     * 在实体删除后调用。
     */
    afterRemove(event: RemoveEvent<any>) {
        console.log(
            `AFTER ENTITY WITH ID ${event.entityId} REMOVED: `,
            event.entity,
        )
    }

    /**
     * 在软删除实体之前调用。
     */
    beforeSoftRemove(event: SoftRemoveEvent<any>) {
        console.log(
            `BEFORE ENTITY WITH ID ${event.entityId} SOFT REMOVED: `,
            event.entity,
        )
      event.entity.updatedAt = dayjs().unix();
      event.entity.deletedBy = AlsGetUserSession()?.OpUserId || 0;
    }

    /**
     * 在软删除实体后调用。
     */
    afterSoftRemove(event: SoftRemoveEvent<any>) {
        console.log(
            `AFTER ENTITY WITH ID ${event.entityId} SOFT REMOVED: `,
            event.entity,
        )
    }

    /**
     * 在恢复实体之前调用。
     */
    beforeRecover(event: RecoverEvent<any>) {
        console.log(
            `BEFORE ENTITY WITH ID ${event.entityId} RECOVERED: `,
            event.entity,
        )
    }

    /**
     * 在恢复实体后调用。
     */
    afterRecover(event: RecoverEvent<any>) {
        console.log(
            `AFTER ENTITY WITH ID ${event.entityId} RECOVERED: `,
            event.entity,
        )
    }

    /**
     * 在事务开始之前调用。
     */
    beforeTransactionStart(event: TransactionStartEvent) {
        // console.log(`BEFORE TRANSACTION STARTED: `, event)
    }

    /**
     * 在事务开始后调用。
     */
    afterTransactionStart(event: TransactionStartEvent) {
        // console.log(`AFTER TRANSACTION STARTED: `, event)
    }

    /**
     * 在事务提交之前调用。
     */
    beforeTransactionCommit(event: TransactionCommitEvent) {
        // console.log(`BEFORE TRANSACTION COMMITTED: `, event)
    }

    /**
     * 在事务提交后调用。
     */
    afterTransactionCommit(event: TransactionCommitEvent) {
        // console.log(`AFTER TRANSACTION COMMITTED: `, event)
    }

    /**
     * 在事务回滚之前调用。
     */
    beforeTransactionRollback(event: TransactionRollbackEvent) {
        // console.log(`BEFORE TRANSACTION ROLLBACK: `, event)
    }

    /**
     * 在事务回滚后调用。
     */
    afterTransactionRollback(event: TransactionRollbackEvent) {
        // console.log(`AFTER TRANSACTION ROLLBACK: `, event)
    }
}