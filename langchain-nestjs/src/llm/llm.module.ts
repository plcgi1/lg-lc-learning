import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LLMService } from "./llm.service";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [LLMService],
  exports: [LLMService],
})
export class LlmsModule {}
