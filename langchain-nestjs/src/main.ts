import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./config/interfaces/config.interface";

// import config from "./config";
//
// const cfg = config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix("api/v1");

  const configService = app.get(ConfigService);

  const appConfig = configService.get<AppConfig>("app");

  const config = new DocumentBuilder()
    .setTitle("Nestjs LLM agent")
    .setDescription("Nestjs LLM agent")
    .setVersion(appConfig.version)
    // TODO надо ли
    // .addBearerAuth(
    //   {
    //     type: "http",
    //     scheme: "bearer",
    //     bearerFormat: "JWT",
    //     name: "JWT",
    //     description: "Enter JWT token",
    //     in: "header",
    //   },
    //   "JWT-auth", // Имя схемы безопасности
    // )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("", app, document);

  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  const logger = app.get(Logger);

  const server = await app.listen(appConfig.port);

  server.setTimeout(600000);

  logger.log(
    { ip: appConfig.ip, port: appConfig.port },
    `Server running on ${appConfig.ip}:${appConfig.port}/api`,
  );
}
bootstrap();
