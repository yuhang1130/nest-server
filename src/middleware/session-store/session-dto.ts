import { Request } from "express";

export class SessionDto {
  UserId: number; // 用户ID
  OpUserId?: number; //  操作者ID，只有request请求时会有这ID。表示请求是以这个UserId为准，例如CreateUserId的过滤，或者创建的时候身份人
  IsSuperMaster?: boolean; // 顶级账号 Uc.User.isMaster shuifei@sunteng.com -- 只有舜飞账号才为true
  Rights: string[];
}

export interface CustomRequest extends Request {
  customToken: string;
}
