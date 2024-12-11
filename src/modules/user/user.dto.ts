import { IsNotEmpty, IsString } from "class-validator";
import { UserEntity } from "./entities/user.entity";

export class UserBaseDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginUserDto extends UserBaseDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  sid: string;
}

export class CreateUserDto extends UserBaseDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export type PartialUser = Pick<
  UserEntity,
  "userName" | "phone" | "isAdmin" | "email"
>;

export class SessionDto {
  UserId: number; // 默认项目ID，如果要获取当前项目ID, 请使用OpUserId ProjectId
  OpUserId?: number; //  操作者ID，只有request请求时会有这ID。表示请求是以这个UserId为准，例如CreateUserId的过滤，或者创建的时候身份人
  Rights: string[];
  User: PartialUser;
}
