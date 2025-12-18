import { IsUUID, IsNotEmpty } from "class-validator";

export class SessionIdDto {
  @IsNotEmpty({ message: "Session ID не может быть пустым" })
  @IsUUID("4", { message: "Session ID должен быть валидным UUID v4" })
  sessionId: string;
}
