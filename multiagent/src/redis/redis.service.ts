import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";
import { appConfig } from "../config/configuration";

const globalConfig = appConfig();

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly client: Redis = new Redis(globalConfig.redis.url);

  onModuleDestroy() {
    this.client.quit();
  }
}
