// App types
export interface AppConfig {
  port: number;
  nodeEnv: string;
  baseApiUrl: string;
  healthCheckApiUrl: string;
  database: {
    mongoUserName: string;
    mongoPassword: string;
    mongoDbName: string;
  },
  cors: {
    origin: string | string[];
  },
  security: {
    cookieSecret: string;
  }
}
