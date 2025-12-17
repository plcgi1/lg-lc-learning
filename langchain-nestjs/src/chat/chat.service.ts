import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { LLMService } from "../llm/llm.service";
import { RedisService } from "../redis/redis.service";
import { ConversationHistoryService } from "../mongo/conversation-history.service";
import { AgentService } from "../agent/agent.service";

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly redisService: RedisService,
    private readonly agentService: AgentService,
    private readonly historyService: ConversationHistoryService,
  ) {}

  async handleChatSession(
    userId: string,
    sessionId: string,
    message: string,
  ): Promise<string> {
    // 1. Инициализация LangChain Memory с Redis Store
    const history = this.redisService.getLangChainHistory(sessionId);

    try {
      // 3. Вызов LLM через Chain
      // const response = await chain.invoke({ input: message });
      const responseText = await this.agentService.runAgent(
        sessionId,
        message,
        history, // Передаем объект истории
      );

      // 4. Промежуточное сохранение полной истории в MongoDB (например, каждые 10 сообщений)
      // В этом примере просто сохраним в конце, но в Production нужно делать это асинхронно
      const currentMessages = await history.getMessages();

      // Асинхронно сохраняем полную историю (для аудита)
      this.historyService
        .saveHistory(userId, sessionId, currentMessages)
        .catch((e) => {
          // Логируем, но не блокируем пользователя
          console.error("Failed to save history asynchronously:", e);
        });

      return responseText;
    } catch (error) {
      this.logger.error(
        `Chat processing failed for session ${sessionId}.`,
        error instanceof Error ? error.stack : error,
      );
      // Ошибки здесь будут включать ошибки Ollama, уже обработанные LLMService
      throw new InternalServerErrorException("Chat processing failed.");
    }
  }
}
