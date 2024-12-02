import { Injectable } from "@nestjs/common";
import {
  CreateUserDto,
  LoginUserDto,
  PartialUser,
  SessionDto,
} from "./user.dto";
import { UserEntity } from "./entities/user.entity";
import { CustomException } from "../../exceptions/custom.exception";
import { ErrorCode } from "../../constants/errorCode-constant";
import * as bcrypt from "bcryptjs";
import * as _ from "lodash";
import { Mysql } from "../../database/mysql";
import { ENTITY_STATUS } from "../../constants/entities-constant";
import {
  AlsGetRequest,
  AlsGetUserSession,
} from "../../async-storage/async-storage";
import { AuthService } from "../../auth/auth.service";
import { UserNamespace } from "../../constants/user-constant";
import * as svgCaptcha from "svg-captcha";
import { RedisSdk } from "../../database/redis";
import { Logger } from "../../logger/logger";

@Injectable()
export class UserService {
  logger = new Logger(UserService.name);
  constructor(
    readonly auth: AuthService,
    readonly mysql: Mysql,
    readonly redisSdk: RedisSdk,
  ) {}

  async register(data: CreateUserDto): Promise<UserEntity> {
    data.userName = data.userName.trim();
    const existUser = await this.getUserByName(data.userName);
    if (existUser) {
      throw new CustomException(ErrorCode.UserExisted);
    }

    const salt = bcrypt.genSaltSync(12);
    data.passWord = bcrypt.hashSync(data.passWord, salt);
    const userData = _.pick(data, ["userName", "passWord", "phone", "email"]);
    const newUser = this.mysql.create(UserEntity, {
      ...userData,
      salt,
      isAdmin: true, // 默认为管理员
    });

    await this.mysql.save(newUser);
    return _.omit(newUser, ["passWord", "salt"]) as UserEntity;
  }

  async login(data: LoginUserDto): Promise<{ token: string }> {
    const sidKey = `sid: ${data.sid}`;
    const captchaText = await this.redisSdk.GetCaptcha(sidKey);
    if (!captchaText) {
      throw new CustomException(ErrorCode.CaptchaInvalid);
    }

    if (captchaText.toLowerCase() !== data.code.toLowerCase()) {
      throw new CustomException(ErrorCode.CaptchaError);
    }

    const existUser = await this.getUserByName(data.userName);
    if (!existUser) {
      throw new CustomException(ErrorCode.UserNotExist);
    }

    const match = bcrypt.compareSync(data.passWord, existUser.passWord);
    if (!match) {
      throw new CustomException(ErrorCode.UserOrPsw);
    }
    if (existUser.status !== ENTITY_STATUS.NORMAL || existUser.isDeleted) {
      throw new CustomException(ErrorCode.UserUnavailable);
    }
    const UserSession: SessionDto = {
      UserId: existUser.id,
      OpUserId: existUser.id,
      User: {
        ..._.pick(existUser, ["userName", "isAdmin", "phone", "email"]),
      },
      Rights: ["test", "test1"],
    };
    AlsGetRequest().session["data"] = UserSession;
    AlsGetRequest().session.save();

    const token = this.auth.signIn({ id: AlsGetRequest().sessionID });
    return { token };
  }

  async getUserByName(name: string): Promise<UserEntity> {
    return await this.mysql.findOne(UserEntity, {
      where: {
        userName: name,
      },
    });
  }

  async logout(): Promise<void> {
    const sessionID = AlsGetRequest().sessionID;
    const UserSession: SessionDto = AlsGetRequest().session[UserNamespace];
    const userName = UserSession?.User?.userName;
    AlsGetRequest().session.destroy(() => {
      this.logger.warn(
        `Logout Success. sessionID: ${sessionID}, userName: ${userName};`,
      );
    });
  }

  async info(): Promise<PartialUser> {
    return AlsGetUserSession().User;
  }

  async captcha(data: { sid: string }) {
    const captcha = svgCaptcha.create({
      size: 4, // 个数
      height: 50,
      ignoreChars: "0o1i", // 验证码字符中排除 0o1i
      color: true, // 字体颜色是否多变
      noise: 2, // 干扰线几条
      background: "#cc9966", // 背景色
    });
    const redisKey = `sid: ${data.sid}`;
    await this.redisSdk.SetCaptcha(redisKey, captcha.text, { ttl: 300 });
    return captcha.data;
  }
}
