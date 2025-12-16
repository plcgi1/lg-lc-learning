// src/chat/chat.controller.ts

import { Controller, Post, Body } from "@nestjs/common";
import { LLMService } from "../llm/llm.service";
import { ChatDto } from "./chat.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly llmService: LLMService) {}

  @Post("simple")
  async handleSimpleChat(@Body() body: ChatDto) {
    const { prompt } = body;

    const response = await this.llmService.generateSimpleResponse(prompt);

    // TODO В Фазе 2 здесь будет логика сохранения истории в MongoDB

    return {
      response: response,
      model: "llama3 (Ollama)",
      success: true,
    };
  }
}
