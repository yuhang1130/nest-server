import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RedisSdk } from './database/redis';
import { IdCounter } from './utils/IdCounter';
import { HttpModule } from '@nestjs/axios';

process.on('unhandledRejection', error => {
  console.log('process.on unhandledRejection', error);
 });

@Global()
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HttpModule,
  ],
  providers: [
    RedisSdk, IdCounter
  ],
  exports: [
    RedisSdk, IdCounter
  ],
})

export class GlobalModule {}
