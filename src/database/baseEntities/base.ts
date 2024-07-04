import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ENTITY_STATUS } from "../../constants/entities-constant";

export class BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @CreateDateColumn({ type: "timestamp" })
    createTime: number;

  @UpdateDateColumn({ type: "timestamp" })
    updateTime: number;

  @Column()
    createUserId: number;

  @Column()
    updateUserId: number;

  @Column({
    type: "enum",
    enum: ENTITY_STATUS,
    default: ENTITY_STATUS.NORMAL,
  })
    status: number = ENTITY_STATUS.NORMAL;

  @Column({
    type: "boolean",
    default: false,
  })
    isDeleted: boolean = false;

  @BeforeInsert()
  handleBeforeInsert() {
    console.log("BeforeInsert---------");
    this.createUserId = 123;
    this.updateUserId = 123;
  }

  @BeforeUpdate()
  handleBeforeUpdate() {
    console.log("BeforeUpdate---------");
    this.updateUserId = 456;
  }
}
