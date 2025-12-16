// src/redis/redis.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
// Импорт из @langchain/community, как мы ранее обсуждали
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { appConfig } from "../config/configuration";

const globalConfig = appConfig();

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    // Получение URI Redis из .env
    const redisUrl = globalConfig.redis.url;

    // Инициализация ioredis клиента
    this.client = new Redis(redisUrl);

    this.client.on("connect", () =>
      this.logger.log("Connected to Redis successfully."),
    );
    this.client.on("error", (err) =>
      this.logger.error("Redis Connection Error:", err.message),
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

  // Здесь могут быть добавлены методы для кэширования LLM-ответов (Фаза 4)
}
