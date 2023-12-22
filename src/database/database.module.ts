import { Global, Module } from '@nestjs/common';
import { MysqlProvider, RedisProvider } from './databas.provider';
import { ConfigModule } from '@nestjs/config';
import { Mysql } from './mysql';
import { RedisSdk } from './redis';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [MysqlProvider, RedisProvider, Mysql, RedisSdk],
	exports: [MysqlProvider, RedisProvider, Mysql, RedisSdk],
})
export class DatabaseModule {}
