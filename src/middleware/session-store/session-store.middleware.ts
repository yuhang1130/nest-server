import * as session from "express-session";
import RedisStore from "connect-redis";
import { RedisSdk } from "../../database/redis";
import { RedisSdkKey } from "../../constants/redis-key";
import { ConfigService } from "@nestjs/config";

const Session = (
  redisSdk: RedisSdk,
  config: ConfigService,
  SessionName: string,
) => {
  const store = new RedisStore({
    client: redisSdk,
    prefix: `${config.get("redisPrefix", "nest_template")}:${
      RedisSdkKey.SessionPrefix
    }`,
  });

  return session({
    resave: false,
    saveUninitialized: false,
    secret: "nest_web",
    name: SessionName,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
    store,
  });
};
export default Session;
