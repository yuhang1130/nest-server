import { Injectable } from "@nestjs/common";
import { Logger } from "../../logger/logger";
import * as dayjs from "dayjs";



@Injectable()
export class ScheduleCheckService {
	private readonly logger = new Logger(ScheduleCheckService.name);

	constructor(){}


  async CheckBySecond() {
    this.logger.info("CheckBySecond executing time: %s", dayjs().format("YYYY-MM-DD HH:mm:ss"));
  }

  async CheckBy5Second() {
    this.logger.info("CheckBy5Second executing time: %s", dayjs().format("YYYY-MM-DD HH:mm:ss"));
  }
}