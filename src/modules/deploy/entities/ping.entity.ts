import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'ping', comment: "健康检测表"})
export class PingEntity {
  @PrimaryGeneratedColumn({ type: 'int', comment: '主键ID' })
  id: number;
}