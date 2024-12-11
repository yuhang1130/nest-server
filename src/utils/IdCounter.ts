import { Injectable } from "@nestjs/common";
import { Logger } from "../logger/logger";
import { RedisSdk } from "../database/redis";

@Injectable()
export class IdCounter {
  logger = new Logger(IdCounter.name);
  constructor(private readonly redisSdk: RedisSdk) {}

  async clearIdCounter(table: string) {
    this.logger.warn("Clear Table %s", table);
    return this.redisSdk.DelIdCounter(table);
  }

  async initByMongo(table: string, value: number, force: boolean = false) {
    if (force) {
      const newV = await this.redisSdk.SetIdCounter(table, value.toString());
      this.logger.warn("force reset Table %s value %d", table, newV);
    } else {
      const hasValue = await this.redisSdk.IdCounterExists(table);
      if (hasValue) {
        this.logger.warn("Table Has Set %s", table);
      } else {
        const newV = await this.redisSdk.SetIdCounter(table, value.toString());
        this.logger.warn("init Table %s value %d", table, newV);
      }
    }
  }

  async getValue(key: string): Promise<number> {
    const hasValue = await this.redisSdk.IdCounterExists(key);
    if (hasValue) {
      return +this.redisSdk.GetIdCounter(key);
    } else {
      return +this.getIncrementId(key, true);
    }
  }

  async getIncrementId(table: string, noPrefix: boolean = false) {
    return this.redisSdk.IncIdCounter(table, {});
  }
}
