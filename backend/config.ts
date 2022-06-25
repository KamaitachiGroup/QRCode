import { JSONObject } from "./src/types/json";

export const config: JSONObject = {
  postgres: {
    maxRetries: 60,
    retryDelay: '1s',
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'database',
    user: process.env.DB_USER || 'database',
    password: process.env.DB_USER_PASSWORD || 'database',
  },
};