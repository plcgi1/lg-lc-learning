import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ChatOllama } from "@langchain/ollama";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../config/interfaces/config.interface";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import {RedisService } from '../redis/redis.service'

@Injectable()
export class LLMService {
  private readonly chatModel: ChatOllama;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    @InjectPinoLogger(LLMService.name)
    private readonly logger: PinoLogger,
  ) {
    const appConfig = configService.get<AppConfig>("app");

    const {
      baseUrl,
      model,
      options: { temperature },
    } = appConfig.ollama;

    this.chatModel = new ChatOllama({
      baseUrl,
      model,
      stop: ["Observation:", "Question:"],
      temperature,
      cache: this.redisService.getCacheClient(),
    });
    this.logger.info(
      `Initialized ChatOllama with model: ${model} at ${baseUrl}`,
    );
  }

  getChatModel() {
    return this.chatModel;
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
}
