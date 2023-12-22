import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AsyncStorageMiddleware } from './middleware/async-store/async-storage.middleware';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { DeployModule } from './modules/deploy/deploy.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		ConfigModule.forRoot({ load: [config] }),
		DatabaseModule,
		DeployModule,

		UserModule,
		AuthModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule implements NestModule {
	static readonly SessionName = 'nest.sid';
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AsyncStorageMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
	}
}
