import express from 'express';
import cors from 'cors';
import {useExpressServer, RoutingControllersOptions, getFromContainer, UnauthorizedError} from 'routing-controllers';
import {appConfig} from './config/app.js';
import {loggingHandler} from './shared/middleware/loggingHandler.js';
import {HttpErrorHandler} from './shared/middleware/errorHandler.js';
import {generateOpenAPISpec} from './shared/functions/generateOpenApiSpec.js';
import {apiReference} from '@scalar/express-api-reference';
import {loadAppModules} from './bootstrap/loadModules.js';
import {printStartupSummary} from './utils/logDetails.js';
import type { CorsOptions } from 'cors';
import { currentUserChecker } from './shared/functions/currentUserChecker.js';
import { authorizationChecker } from './shared/functions/authorizationChecker.js';
import { get } from 'http';
import { AUTH_TYPES } from './modules/auth/types.js';
import { FirebaseAuthService } from './modules/auth/services/FirebaseAuthService.js';

const app = express();

app.use(loggingHandler);

const {controllers, validators} = await loadAppModules(appConfig.module.toLowerCase());

const corsOptions: CorsOptions = {
  origin: appConfig.origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

const moduleOptions: RoutingControllersOptions = {
  controllers: controllers,
  middlewares: [HttpErrorHandler],
  routePrefix: '/api',
  // authorizationChecker: authorizationChecker,
  authorizationChecker: async (action, roles) => true,
  currentUserChecker: currentUserChecker,
  defaultErrorHandler: true,
  development: appConfig.isDevelopment,
  validation: true,
  cors: corsOptions,
};

const openApiSpec = await generateOpenAPISpec(moduleOptions, validators);
app.use(
  '/reference',
  apiReference({
    content: openApiSpec,
    theme: 'elysiajs',
  }),
);

// Start server
useExpressServer(app, moduleOptions);
app.listen(appConfig.port, () => {
  printStartupSummary();
});
