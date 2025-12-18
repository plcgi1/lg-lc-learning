import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LLMService } from "../llm/llm.service";
import { RedisService } from "../redis/redis.service";
import { ConversationHistoryService } from "../mongo/conversation-history.service";
import { AgentService } from "../agent/agent.service";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: LLMService,
    private readonly redisService: RedisService,
    private readonly agentService: AgentService,
    private readonly historyService: ConversationHistoryService,
    @InjectPinoLogger(ChatService.name)
    private readonly logger: PinoLogger,
  ) {}

  async handleChatSession(
    userId: string,
    sessionId: string,
    message: string,
  ): Promise<string> {
    const history = this.redisService.getLangChainHistory(sessionId);

    try {
      const responseText = await this.agentService.runAgent(
        sessionId,
        message,
        history,
      );

      const currentMessages = await history.getMessages();

      this.historyService
        .saveHistory(userId, sessionId, currentMessages)
        .catch((e) => {
          console.error("Failed to save history asynchronously:", e);
        });

      return responseText;
    } catch (error) {
      this.logger.error(
        `Chat processing failed for session ${sessionId}.`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException("Chat processing failed.");
    }
  }
}
