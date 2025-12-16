import { ApiProperty } from "@nestjs/swagger";

export class ChatDto {
  @ApiProperty({
    example: "Запрос пользователя",
    description: "Ктоя я",
  })
  prompt: string;

  @ApiProperty({
    description: "Пользователь",
  })
  userId: string;

  @ApiProperty({
    description: "ID сессии",
  })
  sessionId: string;
}
