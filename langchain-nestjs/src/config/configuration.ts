import { registerAs } from "@nestjs/config";
import { defaultConfig } from "./envs/default";
import { AppConfig } from "./interfaces/config.interface";
import { developmentConfig } from "./envs/development";

const environments: Record<string, Partial<AppConfig>> = {
  production: developmentConfig,
  development: defaultConfig, // Для dev используем default как есть
  // staging: stagingConfig,
};

export const appConfig = registerAs("app", (): AppConfig => {
  const currentEnv = process.env.NODE_ENV || "development";
  const environmentConfig = environments[currentEnv] || {};
  const result = { ...defaultConfig, ...environmentConfig };
  return result;
});
