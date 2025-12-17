import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { LlmsModule } from "./llm/llm.module";
import { ChatModule } from "./chat/chat.module";
import { appConfig } from "./config/configuration";
import { MongoModule } from "./mongo/mongo.module"; // Импортируем наш новый модуль
import { RedisModule } from "./redis/redis.module";
import { ToolsModule } from "./tools/tools.module";

const globalConfig = appConfig();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делает конфиг доступным во всем приложении
      load: [appConfig],
      envFilePath: [".env"],
    }),
    LoggerModule.forRoot({
      pinoHttp: globalConfig.logging,
    }),
    LlmsModule,
    ChatModule,
    MongoModule,
    RedisModule,
    ToolsModule,
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
