import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ScheduleDemoService } from "./schedule-demo.service";


@Injectable()
export class ScheduleDemo {
  constructor(
    private readonly service: ScheduleDemoService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async pingBy10Seconds(): Promise<void> {
    await this.service.pingBy10Seconds();
  }

}