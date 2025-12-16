export interface LoggingConfig {
  transport?: { target: string; options?: any };
  serializers?: Record<string, (r: any) => any>;
  level: string;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  options: {
    temperature: number;
  };
}

export interface AppConfig {
  env: string;
  port: number;
  version: string;
  ip: string;
  logging: LoggingConfig;
  ollama: OllamaConfig;
}
