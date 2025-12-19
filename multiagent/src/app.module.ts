import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { appConfig } from "./config/configuration";
import { MongoModule } from "./mongo/mongo.module";
import { ToolsModule } from "./tools/tools.module";
import { ResearchModule } from "./research/research.module";
import { RedisModule } from "./redis/redis.module";

const globalConfig = appConfig();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [".env"],
    }),
    LoggerModule.forRoot({
      pinoHttp: globalConfig.logging,
    }),
    ResearchModule,
    MongoModule,
    ToolsModule,
      RedisModule
  ],
})
export class AppModule {}
