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
    bcryptRounds: number;
  },
  firebase: {
    serviceAccountKey: string;
  },
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  },
  application: {
    appName: string;
    appUrl: string;
    frontendUrl: string;
  },
  email: {
    apiKey: string;
    emailFrom: string;
  }
}
