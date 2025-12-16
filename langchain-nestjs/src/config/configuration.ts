import { registerAs } from "@nestjs/config";
import { merge } from "lodash";

import { defaultConfig } from "./envs/default";
import { AppConfig } from "./interfaces/config.interface";
import { developmentConfig } from "./envs/development";

// Маппинг окружений. Добавляй сюда сколько угодно новых.
const environments: Record<string, Partial<AppConfig>> = {
  production: developmentConfig,
  development: defaultConfig, // Для dev используем default как есть
  // staging: stagingConfig,
};

export const appConfig = registerAs("app", (): AppConfig => {
  const currentEnv = process.env.NODE_ENV || "development";
  const environmentConfig = environments[currentEnv] || {};

  // merge из lodash делает глубокое слияние.
  // Функции внутри объектов (например, serializers) тоже корректно перенесутся.
  const result = merge({}, defaultConfig, environmentConfig);
  return result;
});
