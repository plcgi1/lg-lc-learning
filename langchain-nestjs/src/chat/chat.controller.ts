// src/chat/chat.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { ChatDto } from "./dto/chat.dto";
import { ChatService } from "./chat.service";
import { v4 as uuidv4 } from "uuid";
import { ConversationHistoryService } from "../mongo/conversation-history.service";
import { SessionIdDto } from "./dto/get-history.dto";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly historyService: ConversationHistoryService,
  ) {}

  @Post("simple")
  async handleSimpleChat(@Body() body: ChatDto) {
    const { prompt, userId, sessionId } = body;
    const incomingSessionId = sessionId || uuidv4();

    const response = await this.chatService.handleChatSession(
      userId,
      incomingSessionId,
      prompt,
    );

    return {
      response: response,
      model: "llama3 (Ollama)",
      sessionId: incomingSessionId,
      success: true,
    };
  }

  /**
   * GET /chat/history/:sessionId
   * Получает всю историю разговора из MongoDB.
   */
  @Get("history/:sessionId")
  @UsePipes(new ValidationPipe({ transform: true })) // Применяем Pipe
  async getHistory(@Param() params: SessionIdDto) {
    const { sessionId } = params;

    const history = await this.historyService.getHistoryBySessionId(sessionId);

    if (!history) {
      throw new HttpException(
        `Conversation with ID ${sessionId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return history;
  }
}
