import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, LoginResultDto, LoginUserDto, PartialUser, SessionDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { CustomException } from '../../exceptions/custom.exception';
import { ErrorCode } from '../../constants/errorCode-constant';
import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import { Mysql } from '../../database/mysql';
import { ENTITY_STATUS } from '../../constants/entities-constant';
import { AlsGetRequest, AlsGetUserSession } from '../../async-storage/async-storage';
import { AuthService } from '../../auth/auth.service';
import { UserNamespace } from '../../constants/user-constant';
import * as svgCaptcha from 'svg-captcha';
import { RedisSdk } from '../../database/redis';

@Injectable()
export class UserService {
	logger = new Logger(UserService.name);
	constructor(
		readonly auth: AuthService,
		readonly mysql: Mysql,
		readonly redisSdk: RedisSdk,
	) {}

	async register(data: CreateUserDto): Promise<UserEntity> {
		data.user_name = data.user_name.trim();
		const existUser = await this.getUserByName(data.user_name);
		if (existUser) {
			throw new CustomException(ErrorCode.UserExisted);
		}

		const salt = bcrypt.genSaltSync(12);
		data.pass_word = bcrypt.hashSync(data.pass_word, salt);
		const userData = _.pick(data, ['user_name', 'pass_word', 'phone', 'email']);
		const newUser = await this.mysql.create(UserEntity, { ...userData, salt });

		await this.mysql.save(newUser);
		return _.omit(newUser, ['pass_word', 'salt']) as UserEntity;
	}

	async login(data: LoginUserDto): Promise<LoginResultDto> {
		const sidKey = `sid: ${data.sid}`;
		const captchaText = await this.redisSdk.GetCaptcha(sidKey);
		if (!captchaText) {
			throw new CustomException(ErrorCode.CaptchaInvalid);
		}

		if (captchaText.toLowerCase() !== data.code.toLowerCase()) {
			throw new CustomException(ErrorCode.CaptchaError);
		}

		const existUser = await this.getUserByName(data.user_name);
		if (!existUser) {
			throw new CustomException(ErrorCode.UserNotExist);
		}

		const match = bcrypt.compareSync(data.pass_word, existUser.pass_word);
		if (!match) {
			throw new CustomException(ErrorCode.UserOrPsw);
		}
		if (existUser.status !== ENTITY_STATUS.NORMAL || existUser.is_deleted) {
			throw new CustomException(ErrorCode.UserUnavailable);
		}
		const UserSession: SessionDto = {
			UserId: existUser.id,
			OpUserId: existUser.id,
			User: {
				..._.pick(existUser, ['user_name', 'is_admin', 'phone', 'email']),
			},
			Rights: ['test', 'test1'],
		};
		AlsGetRequest().session['data'] = UserSession;
		AlsGetRequest().session.save();

		const result: LoginResultDto = new LoginResultDto();
		const token = this.auth.signIn({ id: AlsGetRequest().sessionID });
		result['data'] = {
			token,
		};
		return result;
	}

	async getUserByName(name: string): Promise<UserEntity> {
		return await this.mysql.findOne(UserEntity, {
			where: {
				user_name: name,
			},
		});
	}

	async logout(): Promise<void> {
		const sessionID = AlsGetRequest().sessionID;
		const UserSession: SessionDto = AlsGetRequest().session[UserNamespace];
		const user_name = UserSession?.User?.user_name;
		AlsGetRequest().session.destroy(() => {
			this.logger.warn(`Logout Success. sessionID: ${sessionID}, user_name: ${user_name};`);
		});
	}

	async info(): Promise<PartialUser> {
		return AlsGetUserSession().User;
	}

	// todo...针对ip加锁，限制频率
	async captcha(data: { sid: string }) {
		const captcha = svgCaptcha.create({
			size: 4, // 个数
			height: 50,
			ignoreChars: '0o1i', // 验证码字符中排除 0o1i
			color: true, // 字体颜色是否多变
			noise: 2, // 干扰线几条
			background: '#cc9966', // 背景色
		});
		const redisKey = `sid: ${data.sid}`;
		await this.redisSdk.SetCaptcha(redisKey, captcha.text, { ttl: 300 });
		return captcha.data;
	}
}
