import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";
import { RedisSdkKey } from "../constants/redis-key";

type DelInterface = (key: string) => Promise<number>;
type SetInterface = (
  key: string,
  value: string,
  opts: { ttl?: number; reset?: boolean },
) => Promise<string | number>;
type GetInterface = (key: string) => Promise<string | null>;

@Injectable()
export class RedisSdk implements BeforeApplicationShutdown {
  logger = new Logger(RedisSdk.name);
  lockers = [];
  private readonly JsonPrefix = this.getPrefix(RedisSdkKey.JsonPrefix);

  async beforeApplicationShutdown() {
    this.logger.warn(
      `beforeApplicationShutdown RedisSdk Start Remove The Lock: ${this?.lockers?.length}`,
    );
  }

  // session
  readonly SessionCache = this.NewJsonCache(
    this.getPrefix(RedisSdkKey.SessionPrefix),
  );
  // LoginId -> sessionId[]的 映射
  readonly LoginIdMapSessionIdsCache = this.NewJsonCache(
    this.getPrefix(RedisSdkKey.LoginIdMapSessionIdsPrefix),
  );

  constructor(
    @Inject("REDIS_CONNECTION") readonly client: Redis,
    readonly config: ConfigService,
  ) {}

  getPrefix(k: RedisSdkKey): string {
    return `${this.config.get("redisPrefix", "nest_template")}:${k}`;
  }

  NewJsonCache(prefix?: string) {
    return {
      Set: this.SetJson.bind(this, prefix) as (
        key: string | number,
        value: any,
        ttl: number,
      ) => Promise<boolean>,
      Get: this.GetJson.bind(this, prefix) as (
        key: string | number,
      ) => Promise<any>,
      Del: this.DelJson.bind(this, prefix) as (
        ...keys: Array<string | number>
      ) => Promise<void>,
      Exists: this.ExistsJson.bind(this, prefix) as (
        key: string | number,
      ) => Promise<boolean>,
      Expire: this.ExpireJson.bind(this, prefix) as (
        key: string | number,
        ttl: number,
      ) => Promise<number>,
      Ttl: this.TtlJson.bind(this, prefix) as (
        key: string | number,
      ) => Promise<number>,
    };
  }

  async SetJson(
    prefix: string | null | undefined,
    key: string | number,
    value: any,
    ttl: number,
  ): Promise<boolean> {
    prefix = prefix || this.JsonPrefix;
    const k = prefix + key;
    const v = JSON.stringify(value);
    const ret = await this.client.set(k, v, "EX", Math.round(ttl));
    if (ret !== "OK") {
      this.logger.error(`SetJsonError; ${ret}, ${v}`);
      return false;
    }

    return true;
  }

  async GetJson<T = any>(
    prefix: string | null | undefined,
    key: string | number,
  ): Promise<T | null> {
    prefix = prefix || this.JsonPrefix;
    const k = prefix + key;
    const ret = await this.client.get(k);
    if (!ret) {
      return null;
    }

    try {
      return JSON.parse(ret) as T;
    } catch (e) {
      this.logger.error(`GetJson ParseError; ${k}: ${ret}; ${e.message}`);
    }

    return null;
  }

  async DelJson(
    prefix: string | null | undefined,
    ...keys: Array<string | number>
  ) {
    prefix = prefix || this.JsonPrefix;
    await Promise.all(keys.map((key) => this.client.del(prefix + key)));
  }

  async ExistsJson(
    prefix: string | null | undefined,
    key: string | number,
  ): Promise<boolean> {
    prefix = prefix || this.JsonPrefix;
    const k = prefix + key;
    return (await this.client.exists(k)) === 1;
  }

  async ExpireJson(
    prefix: string | null | undefined,
    key: string | number,
    ttl: number,
  ): Promise<number> {
    prefix = prefix || this.JsonPrefix;
    const k = prefix + key;
    return this.client.expire(k, ttl);
  }

  async TtlJson(
    prefix: string | null | undefined,
    key: string | number,
  ): Promise<number> {
    prefix = prefix || this.JsonPrefix;
    const k = prefix + key;
    return this.client.ttl(k);
  }

  // 这些get和set方法，会话存储会用到
  private async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  private async set(
    key: string,
    v: string,
    opts: { ttl: number; reset?: boolean },
  ): Promise<string | number> {
    if (opts?.reset) {
      return this.client.del(key);
    }

    return this.client.set(key, v, "EX", Math.round(opts?.ttl) || 24 * 3600);
  }

  private async del(key: string[]): Promise<number> {
    return this.client.del(key);
  }

  private async Set(
    prefix: string,
    key: string,
    v: string,
    opts: { ttl: number; reset?: boolean },
  ): Promise<string | number> {
    const k = prefix + key;
    if (opts?.reset) {
      return this.client.del(k);
    }

    return this.client.set(k, v, "EX", Math.round(opts?.ttl) || 24 * 3600);
  }

  private async Del(prefix: string, key: string): Promise<number> {
    const k = prefix + key;
    return this.client.del(k);
  }

  private async Get(prefix: string, key: string): Promise<string | null> {
    const k = prefix + key;
    return this.client.get(k);
  }

  private async expire(key: string, ttl: number): Promise<number> {
    return this.client.expire(key, ttl);
  }

  SetCaptcha: SetInterface = this.Set.bind(this, RedisSdkKey.CaptchaPrefix);
  GetCaptcha: GetInterface = this.Get.bind(this, RedisSdkKey.CaptchaPrefix);
  DelCaptcha: DelInterface = this.Del.bind(this, RedisSdkKey.CaptchaPrefix);
}
