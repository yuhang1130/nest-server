import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface AuthJwtToken {
	id: string;
}

@Injectable()
export class AuthService {
	logger = new Logger(AuthService.name);
	constructor(
		private jwtService: JwtService
	) {}

	signIn(payload: AuthJwtToken): string {
		return this.jwtService.sign(payload);
	}

	decode(token: string): AuthJwtToken|null {
		try {
			return this.jwtService.decode(token) as AuthJwtToken|null;
		} catch (e) {
			this.logger.error(JSON.stringify(e));
		}

		return null;
	}
}
