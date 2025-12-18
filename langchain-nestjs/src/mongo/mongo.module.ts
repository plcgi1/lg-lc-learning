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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: globalConfig.mongo.uri, // Получение URI из .env
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  providers: [ConversationHistoryService],
  exports: [ConversationHistoryService, MongooseModule],
})
export class MongoModule {}
