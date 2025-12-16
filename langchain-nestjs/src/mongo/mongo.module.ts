import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  Conversation,
  ConversationSchema,
} from "./schemas/conversation.schema";
import { ConversationHistoryService } from "./conversation-history.service";
import { appConfig } from "../config/configuration";

const globalConfig = appConfig();

@Module({
  imports: [
    // 1. Настройка подключения к MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: globalConfig.mongo.uri, // Получение URI из .env
      }),
      inject: [ConfigService],
    }),

    // 2. Регистрация схемы для использования в сервисах
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  providers: [ConversationHistoryService],
  exports: [ConversationHistoryService, MongooseModule], // Экспортируем сервис истории
})
export class MongoModule {}
