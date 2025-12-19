import { ApiProperty } from "@nestjs/swagger";

export class CreateResearchDto {
  @ApiProperty({
    example: "Физиология дыхания",
    description: "Запрос пользователя",
    required: true,
  })
  query: string;
}
