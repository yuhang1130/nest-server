import { Global, Module } from "@nestjs/common";
import { MongoProvider, MysqlProvider, RedisProvider } from "./databas.provider";
import { ConfigModule } from "@nestjs/config";
import { Mysql } from "./mysql";
import { RedisSdk } from "./redis";
import { Mongo } from "./mongo";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MysqlProvider, MongoProvider, RedisProvider, Mysql, Mongo, RedisSdk],
  exports: [MysqlProvider, MongoProvider, RedisProvider, Mysql, Mongo, RedisSdk],
})
export class DatabaseModule {}
