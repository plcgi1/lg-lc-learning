import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNotEmpty, IsString } from "class-validator";

export class CreateResearchDto {
  @ApiProperty({
    example: "Физиология дыхания",
    description: "Запрос пользователя",
    required: true,
  })
  query: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description:
      "Уникальный идентификатор сессии (UUID v4) для сохранения истории в MongoDB",
    format: "uuid", // Указывает Swagger на формат строки
    required: true,
  })
  @IsUUID("4") // Проверка, что это именно UUID v4
  @IsNotEmpty()
  threadId: string;
}
