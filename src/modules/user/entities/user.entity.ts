import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../database/baseEntities/base";

@Entity("user")
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 32, comment: "用户名称"})
  userName: string;

  @Column({ type: "varchar", length: 255, comment: "密码" })
  password: string;

  @Column({ type: "varchar", length: 255,comment: "密码盐"})
  salt: string;

  @Column({ type: "boolean", comment: "是否为管理员", default: false })
  isAdmin: boolean = false;

  @Column({ type: "varchar", length: 20, comment: "手机号"})
  phone: string;

  @Column({ type: "varchar", length: 50, comment: "邮箱"})
  email: string;
}
