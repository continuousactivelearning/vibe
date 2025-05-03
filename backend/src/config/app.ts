import {env} from '../utils/env';
import 'reflect-metadata';
import './di';

function getAppPath() {
  let currentDir = __dirname;
  currentDir = currentDir.replace('/config', '');

  return currentDir;
}

export const appConfig = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'staging',
  isDevelopment: process.env.NODE_ENV === 'development',
  name: process.env.APP_NAME,
  port: Number(process.env.APP_PORT) || 4000,
  routePrefix: process.env.APP_ROUTE_PREFIX,
  url: process.env.APP_URL,
};
