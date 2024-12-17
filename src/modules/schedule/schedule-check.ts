import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { ScheduleCheckService } from './schedule-check.service';

@Injectable()
export class ScheduleCheck {
	constructor(
		readonly service: ScheduleCheckService,
	) {}
	
	@Cron(CronExpression.EVERY_SECOND)
	async CheckBySecond() {
		await this.service.CheckBySecond();
	}

  @Cron(CronExpression.EVERY_5_SECONDS)
	async CheckBy5Second() {
		await this.service.CheckBy5Second();
	}
}
