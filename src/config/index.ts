export const deployEnv = process.env.DEPLOY_ENV || "local";
export const isLocal = deployEnv === "local";
export const isProd = deployEnv === "prod";
export const logLevel = process.env.LOG_LEVEL || "";

export const config = () => ({
  env: process.env.DEPLOY_ENV || "local",
  port: +process.env.PORT,
  jwt: {
    secret:
      process.env.JWT_SECRET || "Z6iQ9Yw2dghUEOponPmZloRQEd6CnYjw",
    expire: 24 * 60 * 60, // 单位秒
    // expire: 2, // 单位秒
  },
  mysqlUrl: process.env.MYSQL_URL || 'mysql://mysqlName:mysql123@localhost:3309/hh',
  mongoUrl: process.env.MONGO_URL || 'mongodb://root:mongo123@localhost:27019/',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6389',
    password: process.env.REDIS_PWD || '',
    db: process.env.REDIS_DB || 0,
  },
  redisPrefix: process.env.REDIS_PREFIX || "nest-server-qa",
});
export type ConfigType = ReturnType<typeof config>
