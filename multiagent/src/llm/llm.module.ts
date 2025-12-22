import { Module, Global } from "@nestjs/common";
import { ChatOllama } from "@langchain/ollama";
import { RedisCache } from "@langchain/community/caches/ioredis";
import { RedisService } from "../redis/redis.service";
import { RedisModule } from "../redis/redis.module";
import { appConfig } from "../config/configuration";

const globalConfig = appConfig();

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: "LLM_MODEL",
      useFactory: (redisService: RedisService) => {
        // Создаем кэш для LangChain
        const cache = new RedisCache(redisService.client);

        return new ChatOllama({
          model: globalConfig.ollama.model,
          baseUrl: globalConfig.ollama.baseUrl,
          format: "json",
          temperature: globalConfig.ollama.options.temperature,
          cache: cache,
          // numCtx: 4096,
        });
      },
      inject: [RedisService],
    },
  ],
  exports: ["LLM_MODEL"],
})
export class LlmModule {}
