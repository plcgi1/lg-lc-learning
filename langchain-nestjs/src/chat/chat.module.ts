import { Module } from "@nestjs/common";
import { LlmsModule } from "../llm/llm.module";
import { ChatController } from "./chat.controller";
import { LLMService } from "../llm/llm.service";
import { ChatService } from "./chat.service";
import { RedisService } from "../redis/redis.service";
import { ConversationHistoryService } from "../mongo/conversation-history.service";
import { RedisModule } from "../redis/redis.module";
import { MongoModule } from "../mongo/mongo.module";
import { AgentModule } from "../agent/agent.module";

@Module({
  imports: [LlmsModule, RedisModule, MongoModule, AgentModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    LLMService,
    RedisService,
    ConversationHistoryService,
  ],
})
export class ChatModule {}
