import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import * as _ from "lodash";
import { isLocal } from "../config";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

const logger = new Logger("databaseProvider");

export const MysqlProvider = {
  inject: [ConfigService],
  provide: "MYSQL_CONNECTION",
  useFactory: async (config: ConfigService): Promise<DataSource> => {
    try {
      const mysqlConf = config.get("mysql", {});
      const connectConf: MysqlConnectionOptions = {
        ...mysqlConf,
        type: "mysql",
        entities: [__dirname + "/../**/**/*.entity{.ts,.js}"],
        synchronize: isLocal,
        connectorPackage: "mysql2",
        namingStrategy: new SnakeNamingStrategy(), // 自动将实体表字段名驼峰转下划线
      };
      logger.log(`连接mysql: ${JSON.stringify(connectConf)}`);
      const dataSource = new DataSource(connectConf);
      await dataSource.initialize();
      if (dataSource.isInitialized) {
        logger.log("MYSQL Connect Success");
      } else {
        logger.error("MYSQL Connect Error");
      }
      return dataSource;
    } catch (e) {
      logger.error("MYSQL Connect Error: " + e.message);
    }

    return null;
  },
};

export const RedisProvider = {
  inject: [ConfigService],
  provide: "REDIS_CONNECTION",
  useFactory: (config: ConfigService) => {
    try {
      const redisConf = config.get("redis");
      logger.log(`连接redis: ${JSON.stringify(redisConf)}`);
      if (_.isArray(redisConf)) {
        const cluster = new Redis.Cluster(redisConf, {
          enableReadyCheck: true,
          enableOfflineQueue: false,
        });
        cluster.on("error", (e) => {
          logger.error(`Redis Cluster Error: ${JSON.stringify(e)}`);
        });
        cluster.on("connect", () => {
          logger.log("Redis Cluster Connect Success");
        });
        return cluster;
      }
      const redis = new Redis(redisConf);
      redis.on("error", (e) => {
        logger.error(`Redis Error: ${JSON.stringify(e)}`);
      });
      redis.on("connect", () => {
        logger.log("Redis Connect Success");
      });
      return redis;
    } catch (e) {
      logger.error("Redis Connect Error: " + e?.message);
    }
    return null;
  },
};
