import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";
import * as compression from "compression";
import helmet from "helmet";
import * as bodyParser from "body-parser";
import Session from "./middleware/session-store/session-store.middleware";
import { ValidationPipe } from "@nestjs/common";
import { RedisSdk } from "./database/redis";
import { JwtParseMiddleware } from "./middleware/jwt-parse/jwt-parse.middleware";
import { AuthService } from "./auth/auth.service";
import { TransformInterceptor } from "./interceptor/transform/transform.interceptor";
import { Logger } from "./logger/logger";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // logger:
    // 	+process.env.DEBUG || process.env.ENV_FLAG === "local"
    // 		? ["log", "error", "warn", "debug"]
    // 		: ["error", "warn"],
  });
  app.enableShutdownHooks();
  app.enableCors();
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(10 * 60e3);
    next();
  });
  app.use(compression());
  app.use(helmet());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  const configService = app.get(ConfigService);
  app.use(JwtParseMiddleware(app.get(AuthService), AppModule.SessionName));
  app.use(Session(app.get(RedisSdk), configService, AppModule.SessionName));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: { target: false },
    }),
  );
  const port = configService.get("port");
  await app.listen(port).then(() => {
    const logger = new Logger(AppModule.name);
    logger.info(`Server Start: http://localhost:${port}`);
  });
}
bootstrap().then();
