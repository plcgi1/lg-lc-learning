// src/agent/agent.module.ts

import { Module } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { LlmsModule } from "../llm/llm.module"; // Нужен для ChatModel
import { RedisModule } from "../redis/redis.module"; // Нужен для Redis Service
import { ToolsModule } from "../tools/tools.module"; // Нужен для инструментов

@Module({
  imports: [LlmsModule, RedisModule, ToolsModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
