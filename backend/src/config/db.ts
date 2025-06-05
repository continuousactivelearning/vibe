import {env} from '../utils/env';

// Use env utility for all env access for consistency
export const dbConfig = {
  url: env('DB_URL') || 'mongodb://localhost:27017/vibe-test',
  dbName: env('DB_NAME') || 'vibe',
};
