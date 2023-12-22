import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, LoginResultDto, LoginUserDto, PartialUser, SessionDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class UserService {
	logger = new Logger(UserService.name);
	constructor(
		readonly configService: ConfigService,
		readonly auth: AuthService,
		readonly mysql: Mysql,
	) {}

	async register(data: CreateUserDto): Promise<UserEntity> {
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
			Rights: [],
		};
		AlsGetRequest().session['data'] = UserSession;
		AlsGetRequest().session.save();

		const result: LoginResultDto = new LoginResultDto();
		result.token = this.auth.signIn({ id: AlsGetRequest().sessionID });

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

	async create(data: CreateUserDto): Promise<boolean> {

		return true;
	}

	findAll() {
		return `This action returns all user`;
	}

	async info(): Promise<PartialUser> {
		return AlsGetUserSession().User;
	}

	update(data: any) {
		return `This action updates  user`;
	}

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
