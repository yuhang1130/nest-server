import {NestFactory} from "@nestjs/core";
import { CustomScheduleModule } from "../modules/schedule/schedule.module";

async function bootstrap() {
	const app = await NestFactory.create(CustomScheduleModule, {
		logger: (+process.env.DEBUG || process.env.ENV_FLAG === 'qa')  ? ['log', 'error', 'warn', 'debug', 'verbose'] : ['error', 'warn']
	});
	await app.listen(process.env.PORT || 8010);
}
bootstrap();
