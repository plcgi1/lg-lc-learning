import { Module, Global } from '@nestjs/common';
import { ChatOllama } from "@langchain/ollama";
import { RedisCache } from "@langchain/community/caches/ioredis";
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module'
import { appConfig } from "../config/configuration";

const globalConfig = appConfig();

@Global()
@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: 'LLM_MODEL',
            useFactory: (redisService: RedisService) => {
                // Создаем кэш для LangChain
                const cache = new RedisCache(redisService.client);

                return new ChatOllama({
                    model: globalConfig.ollama.model,
           baseUrl: globalConfig.ollama.baseUrl,
           temperature: globalConfig.ollama.options.temperature,
                    cache: cache,
                });
            },
            inject: [RedisService],
        },
    ],
    exports: ['LLM_MODEL'],
})
export class LlmModule {}

// import { Module, Global } from "@nestjs/common";
// import { ConfigModule } from "@nestjs/config";
// import { ChatOllama } from "@langchain/ollama";
// import { appConfig } from "../config/configuration";
// import { RedisCache } from "@langchain/community/caches/ioredis";
// import {RedisModule} from "../redis/redis.module";
// import {RedisService} from "../redis/redis.service";
//
// const globalConfig = appConfig();
//
// @Global() // Делаем модуль глобальным, чтобы не импортировать везде
// @Module({
//     imports: [RedisModule],
//   providers: [
//     {
//       provide: "LLM_MODEL",
//       useFactory: () => {
//         const redisService = new RedisService()
//         const cache = redisService.getCacheClient()
//         return new ChatOllama({
//           model: globalConfig.ollama.model,
//           baseUrl: globalConfig.ollama.baseUrl,
//           temperature: globalConfig.ollama.options.temperature,
//             cache
//         });
//       },
//     },
//   ],
//   exports: ["LLM_MODEL"],
// })
// export class LlmModule {}
