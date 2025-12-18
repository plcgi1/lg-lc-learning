import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { appConfig } from "../config/configuration";
import { RedisCache } from "@langchain/community/caches/ioredis";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

const globalConfig = appConfig();

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(
    private configService: ConfigService,
    @InjectPinoLogger(RedisService.name)
    private readonly logger: PinoLogger,
  ) {
    // Получение URI Redis из .env
    const redisUrl = globalConfig.redis.url;

    // Инициализация ioredis клиента
    this.client = new Redis(redisUrl);

    this.client.on("connect", () =>
      this.logger.info("Connected to Redis successfully."),
    );
    this.client.on("error", (err) =>
      this.logger.error({ err }, "Redis Connection Error:"),
    );

    // В продакшене: логика завершения работы клиента при закрытии приложения
    process.on("exit", () => this.client.disconnect());
  }

  /**
   * Возвращает экземпляр клиента ioredis для прямого доступа (например, для кэширования)
   */
  public getClient(): Redis {
    return this.client;
  }

  getKeyWithPrefix(prefix: string, key: string): string {
    const prefixKey = `${prefix}:${key}`;
    return prefixKey;
  }
  private getCacheProxyClient(prefix: string): Redis {
    // Используем Object.create, чтобы сохранить доступ ко всем методам ioredis
    const proxy = Object.create(this.client);

    // Обертываем метод чтения
    proxy.get = (key: string) => {
      const prefixKey = this.getKeyWithPrefix(prefix, key);
      return this.client.get(prefixKey);
    };

    // Обертываем метод записи
    proxy.set = (key: string, value: string, ...args: any[]) => {
      const prefixKey = this.getKeyWithPrefix(prefix, key);
      return this.client.set(prefixKey, value, ...args);
    };

    // Обертываем метод удаления
    proxy.del = (key: string | string[]) => {
      if (Array.isArray(key)) {
        const prefixedKeys = key.map((k) => {
          return this.getKeyWithPrefix(prefix, k);
        });
        return this.client.del(...prefixedKeys);
      }
      const prefixKey = this.getKeyWithPrefix(prefix, key);
      return this.client.del(prefixKey);
    };

    return proxy;
  }
  /**
   * Возвращает LangChain Message History для конкретной сессии
   * @param sessionId - уникальный идентификатор сессии
   * @param ttlSeconds - Time-To-Live для сессии в секундах (по умолчанию 1 час)
   */
  public getLangChainHistory(
    sessionId: string,
    ttlSeconds: number = 3600,
  ): RedisChatMessageHistory {
    // RedisChatMessageHistory использует ioredis-клиент для хранения сообщений
    return new RedisChatMessageHistory({
      sessionId: sessionId,
      sessionTTL: ttlSeconds,
      client: this.client,
      // Внимание: LangChain префиксует ключи в Redis. По умолчанию: "langchain:message:" + sessionId
    });
  }

  getCacheClient(ttlSeconds: number = 86400): RedisCache {
    const chacheClient = this.getCacheProxyClient("cache");
    const redisCache = new RedisCache(chacheClient, {
      ttl: ttlSeconds,
    });
    return redisCache;
  }
}
