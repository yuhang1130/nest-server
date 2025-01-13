import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ScheduleDemo } from "./schedule-device/schedule-demo";
import { ScheduleDemoService } from "./schedule-device/schedule-demo.service";
import { DatabaseModule } from "../database/database.module";
import { GlobalModule } from "../global.module";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { config } from "../config";
import { DeployModule } from "../modules/deploy/deploy.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ load: [config], envFilePath: '../../.env'}),
    DatabaseModule,
    HttpModule,
    GlobalModule,
    DeployModule,
  ],
  providers: [ScheduleDemo, ScheduleDemoService],
})
export class DemoScheduleModule {}