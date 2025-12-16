// src/config/envs/default.ts
import { AppConfig } from "../interfaces/config.interface";
import * as dotenv from "dotenv";
import * as pack from "../../../package.json";

dotenv.config();

export const defaultConfig: AppConfig = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 4848,
  version: pack.version,
  ip: "0.0.0.0",
  logging: {
    level: "debug",
    transport: {
      target: "pino-pretty",
    },
    serializers: {
      req: (r) => {
        delete r.headers;
        return r;
      },
      res: (r) => {
        delete r.headers;
        return r;
      },
    },
  },

  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama2",
    options: {
      temperature: 0.7,
    },
  },

  redis: {
    url: process.env.REDIS_HOST,
  },

  mongo: {
    uri: process.env.MONGO_URI,
  },
};
