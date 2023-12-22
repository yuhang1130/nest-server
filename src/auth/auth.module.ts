import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const secret = config.get('jwt.secret', 'qwer123456');
				const expire = config.get('jwt.expire', '24h');
				return {
					global: true,
					secret,
					signOptions: {
						expiresIn: expire,
					},
				};
			},
		}),
	],
	providers: [AuthService],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
