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

export interface RedisConfig {
  url: string;
}

export interface mongoConfig {
  uri: string;
  dbName: string;
  checkpointCollectionName: string;
  checkpointWritesCollectionName: string;
}

export interface LanggraphConfig {
  workflow: {
    maxScore: number;
    maxIterations: number;
  };
}

export interface AppConfig {
  env: string;
  port: number;
  version: string;
  ip: string;
  logging: LoggingConfig;
  ollama: OllamaConfig;
  redis: RedisConfig;
  mongo: mongoConfig;
  langGraph: LanggraphConfig;
}
