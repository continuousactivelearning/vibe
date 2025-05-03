import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
  get: (key: string, defaultValue: string | null = null): string =>
    process.env[key] ?? (defaultValue as string),

  MONGO_URI: process.env.MONGO_URI ?? '',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME ?? '',

  require: (key: string): string => {
    if (typeof process.env[key] === 'undefined') {
      throw new Error(`Environment variable ${key} is not set.`);
    }
    return process.env[key] as string;
  },
};
