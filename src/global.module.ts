import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RedisSdk } from './database/redis';
import { IdCounter } from './utils/IdCounter';

process.on('unhandledRejection', error => {
  console.log('process.on unhandledRejection', error);
 });

@Global()
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
  ],
  providers: [
    RedisSdk, IdCounter
  ],
  exports: [
    RedisSdk, IdCounter
  ],
})

export class GlobalModule {}
