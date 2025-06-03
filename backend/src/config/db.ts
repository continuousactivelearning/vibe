import {env} from '../utils/env';

const DB_URL = env('DB_URL');
const DB_USER = env('DB_USER');
const DB_PASS = env('DB_PASS');
const DB_NAME = env('DB_NAME') || 'vibe';
const DB_HOST = env('DB_HOST');
const DB_PORT = env('DB_PORT') || '27017';

// Prefer DB_URL if provided (e.g., Atlas), otherwise construct manually
const url =
  DB_URL ||
  `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

export const dbConfig = {
  url,
  dbName: DB_NAME,
};
/**
 * Configuration for connecting to the MongoDB database.
 * Uses environment variables to set connection parameters.
 *
 * @module dbConfig
 * @category Config
 * @example
 * import { dbConfig } from './config/db';
 * console.log(dbConfig.url); // Outputs the MongoDB connection URL
 */
