import {env} from '../utils/env';

const dbUrl = process.env.DB_URL;
export const dbConfig = {
  url:
    dbUrl && dbUrl.trim() !== ''
      ? dbUrl
      : 'mongodb://localhost:27017/vibe-test',
  dbName: env('DB_NAME') || 'vibe',
};
