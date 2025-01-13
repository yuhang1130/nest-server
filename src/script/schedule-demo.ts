import {NestFactory} from "@nestjs/core";
import { DemoScheduleModule } from "../schedule/schedule.module";
import { initializeTransactionalContext } from "typeorm-transactional";
import { Logger } from "../logger/logger";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(DemoScheduleModule, {
    logger: (+process.env.DEBUG || process.env.ENV_FLAG === 'qa')  ? ['log', 'error', 'warn', 'debug'] : ['error', 'warn']
  });
  app.enableShutdownHooks();
  const configService = app.get(ConfigService);
  const port = configService.get("port") || 9091;
  await app.listen(+port).then(() => {
    const logger = new Logger(DemoScheduleModule.name);
    logger.info(`Server Start: http://localhost:${port}`);
  });
}
bootstrap();
