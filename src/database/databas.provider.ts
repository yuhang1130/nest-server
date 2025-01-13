import { ConfigService } from "@nestjs/config";
import * as _ from "lodash";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { MongoConnectionOptions } from "typeorm/driver/mongodb/MongoConnectionOptions";
import { Logger } from "../logger/logger";
import { ConfigType } from "../config";

const logger = new Logger("databaseProvider");

export const MysqlProvider = {
  inject: [ConfigService],
  provide: "MYSQL_CONNECTION",
  useFactory: async (config: ConfigService<ConfigType>): Promise<DataSource> => {
    try {
      const mysqlUrl = config.get("mysqlUrl", {});
      const connectConf: MysqlConnectionOptions = {
        url: mysqlUrl,
        type: "mysql",
        entities: [__dirname + "/../modules/**/*.entity{.ts,.js}"],
        synchronize: false,
        connectorPackage: "mysql2",
        namingStrategy: new SnakeNamingStrategy(), // 自动将实体表字段名驼峰转下划线
      };
      logger.info("连接mysql: %j", connectConf);
      const dataSource = new DataSource(connectConf);
      await dataSource.initialize();
      if (dataSource.isInitialized) {
        logger.info("MYSQL Connect Success");
      } else {
        logger.error("MYSQL Connect Error");
      }
      return dataSource;
    } catch (e) {
      logger.error("MYSQL Connect Error: %s", e.message);
    }

    return null;
  },
};

export const MongoProvider = {
  inject: [ConfigService],
  provide: "MONGO_CONNECTION",
  useFactory: async (config: ConfigService<ConfigType>): Promise<DataSource> => {
    try {
      const mongoUrl = config.get("mongoUrl", {});

      const connectConf: MongoConnectionOptions = {
        url: mongoUrl,
        authSource: "admin",
        type: "mongodb",
        entities: [__dirname + "/../modules/**/*.entity{.ts,.js}"],
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(), // 自动将实体表字段名驼峰转下划线
      };
      logger.info("连接mongo: %j", connectConf);
      const dataSource = new DataSource(connectConf);
      await dataSource.initialize();
      if (dataSource.isInitialized) {
        logger.info("MONGO Connect Success");
      } else {
        logger.error("MONGO Connect Error");
      }
      return dataSource;
    } catch (e) {
      logger.error("MONGO Connect Error: %s", e.message);
    }

    return null;
  },
};

export const RedisProvider = {
  inject: [ConfigService],
  provide: "REDIS_CONNECTION",
  useFactory: (config: ConfigService<ConfigType>) => {
    try {
      const redisConf = config.get("redis");
      logger.info("连接redis: %j", redisConf);
      if (_.isArray(redisConf)) {
        const cluster = new Redis.Cluster(redisConf, {
          enableReadyCheck: true,
          enableOfflineQueue: false,
        });
        cluster.on("error", (e) => {
          logger.error("Redis Cluster Error: %j", e);
        });
        cluster.on("connect", () => {
          logger.info("Redis Cluster Connect Success");
        });
        return cluster;
      }
      const redis = new Redis(redisConf.url, {
        password: redisConf.password || null,
        db: redisConf.db,
      });
      redis.on("error", (e) => {
        logger.error("Redis Error: %j", e);
      });
      redis.on("connect", () => {
        logger.info("Redis Connect Success");
      });
      return redis;
    } catch (e) {
      logger.error("Redis Connect Error: %s", e?.message);
    }
    return null;
  },
};
