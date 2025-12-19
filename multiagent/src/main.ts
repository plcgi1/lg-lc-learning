import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./config/interfaces/config.interface";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix("api/v1");

  const configService = app.get(ConfigService);

  const appConfig = configService.get<AppConfig>("app");

  const config = new DocumentBuilder()
    .setTitle("Nestjs Multi agent")
    .setDescription("Nestjs Multi agent")
    .setVersion(appConfig.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("", app, document);

  const logger = app.get(Logger);

  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  const server = await app.listen(appConfig.port);

  server.setTimeout(1000000);

  logger.log(
    { ip: appConfig.ip, port: appConfig.port },
    `Server running on ${appConfig.ip}:${appConfig.port}/api`,
  );
}
bootstrap();
