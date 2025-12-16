import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOllama } from "@langchain/ollama";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { AppConfig } from "../config/interfaces/config.interface";

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly chatModel: ChatOllama;

  constructor(private configService: ConfigService) {
    const appConfig = configService.get<AppConfig>("app");

    // 1. Инициализация Ollama из конфигурации
    const {
      baseUrl,
      model,
      options: { temperature },
    } = appConfig.ollama;
    this.chatModel = new ChatOllama({
      baseUrl,
      model,
      // Дополнительные настройки (температура, таймауты)
      temperature,
    });
    this.logger.log(
      `Initialized ChatOllama with model: ${model} at ${baseUrl}`,
    );
  }

  /**
   * Задержка с экспоненциальным ростом
   * @param attempt - текущая попытка
   */
  private async delay(attempt: number): Promise<void> {
    const delayMs = Math.pow(2, attempt) * 100 + Math.random() * 100; // 2^n * 100ms + джиттер
    this.logger.warn(
      `Attempt ${attempt + 1} failed. Retrying in ${delayMs.toFixed(0)}ms...`,
    );
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Выполнение вызова LLM с логикой экспоненциального отката (Exponential Backoff)
   * @param messages - массив сообщений для LLM
   * @param maxRetries - максимальное количество повторных попыток
   */
  public async callModelWithRetry(
    messages: BaseMessage[],
    maxRetries: number = 3,
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.chatModel.invoke(messages);
        // Предполагаем, что response - это строка или что-то, что можно преобразовать
        return typeof response === "string"
          ? response
          : response.content.toString();
      } catch (error) {
        this.logger.error(
          `LLM Call Failed (Attempt ${attempt + 1}):`,
          error.message,
        );

        // В продакшене здесь проверяют коды ошибок (429, 500)
        /* eslintignore */
        if (attempt === maxRetries - 1) {
          throw new InternalServerErrorException(
            "LLM service is currently unavailable or busy after multiple retries.",
          );
        }

        await this.delay(attempt);
      }
    }
  }

  /**
   * Пример использования для демонстрации (без памяти)
   */
  public async generateSimpleResponse(prompt: string): Promise<string> {
    const template = PromptTemplate.fromTemplate(
      "You are a helpful Node.js expert. Answer the following question briefly: {query}",
    );
    const formattedPrompt = await template.format({ query: prompt });
    const message = [new HumanMessage(formattedPrompt)];

    return this.callModelWithRetry(message);
  }
}
