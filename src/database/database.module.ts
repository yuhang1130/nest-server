import { Module } from "@nestjs/common";
import { MongoProvider, MysqlProvider, RedisProvider } from "./databas.provider";
import { ConfigModule } from "@nestjs/config";
import { MysqlService } from "./mysql";
import { RedisSdk } from "./redis";
import { MongoService } from "./mongo";
import { EntitySubscriber } from "./entitySubscriber";


@Module({
  imports: [ConfigModule],
  providers: [MysqlProvider, MongoProvider, RedisProvider, MysqlService, MongoService, RedisSdk, EntitySubscriber],
  exports: [MysqlProvider, MongoProvider, RedisProvider, MysqlService, MongoService, RedisSdk],
})
export class DatabaseModule {}
