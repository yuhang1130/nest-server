import { Module } from '@nestjs/common';
import { GlobalModule } from '../../global.module';
import { ScheduleCheck } from './schedule-check';
import { ScheduleCheckService } from './schedule-check.service';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
	imports: [ScheduleModule.forRoot()],
	providers: [
		ScheduleCheck,
		ScheduleCheckService,
	],
	controllers: [
	],
})
export class CustomScheduleModule {}
