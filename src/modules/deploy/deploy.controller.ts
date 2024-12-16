import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Redis } from "ioredis";
import { Logger } from "../../logger/logger";
import { MysqlService } from "../../database/mysql";
import { PingEntity } from "./entities/ping.entity";
import { MongoService } from "../../database/mongo";

const MAX_FAIL_HEALTH = 12;

@Controller("deploy")
export class DeployController {
  logger = new Logger(DeployController.name);
  mysqlFail = 0;
  redisFail = 0;
  constructor(
    readonly mysql: MysqlService,
    @Inject("REDIS_CONNECTION") readonly redisClient: Redis,
  ) {
  	setInterval(this.mysqlHealthCheck.bind(this), 5e3);
  	setInterval(this.redisHealCheck.bind(this), 5e3);
  }


  async mysqlHealthCheck() {
  	const timeout = new Promise(ok => {
  		setTimeout(() => {
  			ok({ok: false});
  		}, 3e3);
  	});
  	const mysqlCheck = await Promise.race([
      this.mysql.findOneBy(PingEntity,{}).then(() => ({ok: true})),
  		timeout,
  	]).catch(e => {
  		this.logger.warn(`Mysql check error: ${e.message || JSON.stringify(e?.stack)}`, );
  		return {ok: false};
  	}) as any;
  
  	if (mysqlCheck?.ok) {
  		this.mysqlFail = 0;
  	}
  	else {
  		this.mysqlFail ++;
  		this.logger.warn(`MysqlPing fail, count: ${this.mysqlFail}`, );
  		if (this.mysqlFail > MAX_FAIL_HEALTH) {
  			// process.exit(10001);
  		}
  	}
  }

  async redisHealCheck() {
  	const timeout = new Promise(ok => {
  		setTimeout(() => {
  			ok({ok: false});
  		}, 3e3);
  	});
  	const redisCheck = await Promise.race([
  		timeout,
  		this.redisPing(),
  	]).catch(e => {
  		this.logger.warn(`Redis check error: ${e.message || JSON.stringify(e?.stack)}`);
  	}) as any;
  
  	if (redisCheck?.ok) {
  		this.redisFail = 0;
  	} else {
  		this.redisFail ++;
  		this.logger.warn(`Redis fail count: ${this.redisFail}`);
  		if (this.redisFail > MAX_FAIL_HEALTH) {
  			// process.exit(10002);
  		}
  	}
  }

  private async redisPing() {
  	const result = await this.redisClient.ping();
  	return new Promise(ok => {
  		ok({ok: result === 'PONG'});
  	});
  }

  @Get(["ready", "live"])
  async readyLive(): Promise<string> {
    if (this.mysqlFail > MAX_FAIL_HEALTH) {
      throw new ServiceUnavailableException("MysqlUnHealthy");
    }
    if (this.redisFail > MAX_FAIL_HEALTH) {
      throw new ServiceUnavailableException("RedisUnHealthy");
    }
    return "success";
  }
}
