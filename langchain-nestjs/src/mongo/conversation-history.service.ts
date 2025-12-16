import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseMessage } from "@langchain/core/messages";

import {
  Conversation,
  ConversationDocument,
} from "./schemas/conversation.schema";

@Injectable()
export class ConversationHistoryService {
  private readonly logger = new Logger(ConversationHistoryService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  /**
   * Сохраняет полную историю разговора в MongoDB
   * @param userId - ID пользователя
   * @param sessionId - ID сессии
   * @param messages - массив LangChain BaseMessage
   */
  async saveHistory(
    userId: string,
    sessionId: string,
    messages: BaseMessage[],
  ): Promise<ConversationDocument> {
    // Преобразование LangChain BaseMessage в формат, пригодный для MongoDB
    const historyPayload = messages.map((msg) => ({
      type: msg._getType(),
      content: msg.content,
      // Добавьте другие полезные поля, такие как metadata
    }));
    const updateData = {
      $set: {
        messages: historyPayload, // Полностью перезаписываем историю
        userId: userId,
        timestamp: new Date(),
        status: "active",
      },
      // Можно использовать $push для добавления только новых сообщений,
      // но $set: messages проще, так как вы получаете полный массив из Redis
    };

    try {
      const updatedConversation = await this.conversationModel
        .findOneAndUpdate(
          { sessionId: sessionId }, // Критерий поиска
          updateData,
          {
            new: true, // Вернуть обновленный документ
            upsert: true, // Вставить, если не найден
            setDefaultsOnInsert: true, // Установить значения по умолчанию при вставке
          },
        )
        .exec();

      this.logger.log(`Conversation ${sessionId} saved/updated in MongoDB.`);
      return updatedConversation;
    } catch (error) {
      this.logger.error(
        `Error saving history for session ${sessionId}:`,
        error.stack,
      );
      // В продакшене можно добавить логику повторной попытки или fallback
      throw error;
    }
  }

  // Методы для загрузки истории (для возобновления разговора или аудита)
  async getHistoryBySessionId(
    sessionId: string,
  ): Promise<ConversationDocument> {
    return this.conversationModel.findOne({ sessionId }).exec();
  }
}
