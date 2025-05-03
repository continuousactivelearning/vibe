import {env} from '../utils/env';

export const dbConfig = {
  url: process.env.DB_URL,
  dbName: process.env.DB_NAME || 'vibe',
};
