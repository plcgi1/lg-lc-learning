import { Module } from "@nestjs/common";
import { LlmsModule } from "../llm/llm.module";
import { ChatController } from "./chat.controller";
import { LLMService } from "../llm/llm.service";

@Module({
  imports: [LlmsModule],
  controllers: [ChatController],
  providers: [LLMService],
})
export class ChatModule {}
