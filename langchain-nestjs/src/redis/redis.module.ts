import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "./redis.service";

// Делаем модуль глобальным, чтобы другие модули (Chat, LLM) могли
// напрямую использовать RedisService без повторного импорта.
@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
