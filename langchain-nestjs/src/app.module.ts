import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { LlmsModule } from "./llm/llm.module";
import { ChatModule } from "./chat/chat.module";
import { appConfig } from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делает конфиг доступным во всем приложении
      load: [appConfig],
      envFilePath: [".env"],
    }),
    LoggerModule.forRoot({}),
    LlmsModule,
    ChatModule,
  ],
  // TODO надо ли
  // providers: [
  //   // Регистрируем глобальный Guard
  //   {
  //     provide: APP_GUARD,
  //     useClass: ExternalAuthGuard,
  //   },
  // ],
})
export class AppModule {}
