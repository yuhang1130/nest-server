import { Column, PrimaryColumn } from "typeorm";
import { ENTITY_STATUS } from "../../constants/entities-constant";

export class BaseEntity {
  @PrimaryColumn({ type: 'int', comment: '主键ID' })
  id: number;

  @Column({ type: 'int', default: 0, comment: '创建时间戳' })
  createdAt: number;

  @Column({ type: 'int', default: 0, comment: '更新时间戳' })
  updatedAt: number;

  @Column({ type: 'int', default: 0, comment: '操作创建的用户ID' })
  createdBy: number

  @Column({ type: 'int', default: 0, comment: '操作更新的用户ID' })
  updatedBy: number

  @Column({ type: 'int', nullable: true, default: 0, comment: '操作删除的用户ID' })
  deletedBy: number

  @Column({
    type: "enum",
    enum: ENTITY_STATUS,
    default: ENTITY_STATUS.NORMAL,
    comment: "状态"
  })
  status: number = ENTITY_STATUS.NORMAL;

  @Column({
    type: "boolean",
    default: false,
    comment: "是否软删"
  })
  isDeleted: boolean = false; // 是否删除
}
