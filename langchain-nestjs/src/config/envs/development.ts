// src/config/envs/production.ts
import { AppConfig } from "../interfaces/config.interface";

// Переопределяем только то, что нужно для прода
export const developmentConfig: Partial<AppConfig> = {
  logging: {
    level: "info",
    transport: undefined, // Отключаем pretty print (будет JSON)
    serializers: {
      // Твоя кастомная логика для прода
      req: (r) => {
        const copy = { ...r };
        delete copy.headers?.cookie; // Удаляем куки для безопасности
        return copy;
      },
      res: (r) => {
        const copy = { ...r };
        delete copy.headers;
        return copy;
      },
    },
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama2",
    // В проде температура пониже
    options: { temperature: 0.1 },
    // baseUrl и model возьмутся из default (а там из .env)
  },
};
