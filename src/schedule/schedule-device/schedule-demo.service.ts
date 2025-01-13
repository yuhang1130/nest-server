import { Injectable } from "@nestjs/common";
import { MysqlService } from "../../database/mysql";
import * as dayjs from "dayjs";
import { Logger } from "../../logger/logger";
import { ConfigService } from "@nestjs/config";
import * as _ from 'lodash';


@Injectable()
export class ScheduleDemoService {
  private readonly logger = new Logger(ScheduleDemoService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mysql: MysqlService,
  ) {}

  async pingBy10Seconds(): Promise<void> {
    this.logger.info('pingBy10Seconds. time: %s', dayjs().format('YYYY-MM-DD HH:mm:ss'))
  }

}
