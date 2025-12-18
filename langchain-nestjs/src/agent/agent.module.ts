import { Module } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { LlmsModule } from "../llm/llm.module";
import { RedisModule } from "../redis/redis.module";
import { ToolsModule } from "../tools/tools.module";

@Module({
  imports: [LlmsModule, RedisModule, ToolsModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
