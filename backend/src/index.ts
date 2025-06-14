import 'dotenv/config';
import Express from 'express';
import * as Sentry from '@sentry/node';
import {loggingHandler} from 'shared/middleware/loggingHandler';
import {
  RoutingControllersOptions,
  useContainer,
  useExpressServer,
} from 'routing-controllers';
import Container from 'typedi';
import {IDatabase} from 'shared/database';
import {MongoDatabase} from 'shared/database/providers/MongoDatabaseProvider';
import {dbConfig} from 'config/db';
import * as firebase from 'firebase-admin';
import {apiReference} from '@scalar/express-api-reference';
import {OpenApiSpecService} from './modules/docs';
import fetch from 'node-fetch';

import {authModuleOptions} from './modules/auth';
import {coursesModuleOptions} from './modules/courses';
import {usersModuleOptions} from './modules/users';
import {rateLimiter} from 'shared/middleware/rateLimiter';
import {QuestionController} from './modules/quizzes/controllers/QuestionController';

if (process.env.NODE_ENV === 'production') {
  import('./instrument');
}

export const application = Express();

export const ServiceFactory = (
  service: typeof application,
  options: RoutingControllersOptions,
): typeof application => {
  console.log('--------------------------------------------------------');
  console.log('Initializing service server');
  console.log('ENV Loaded:');
  console.log('DB_URL:', process.env.DB_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('--------------------------------------------------------');

  service.use(Express.urlencoded({extended: true}));
  service.use(Express.json());

  if (process.env.NODE_ENV === 'production') {
    service.use(rateLimiter);
  }

  service.use(loggingHandler);

  service.get('/main/healthcheck', (req, res) => {
    res.send('Hello World');
  });

  const openApiSpecService = Container.get(OpenApiSpecService);

  service.get('/docs', (req, res) => {
    try {
      const openApiSpec = openApiSpecService.generateOpenAPISpec();
      const handler = apiReference({
        spec: {content: openApiSpec},
        theme: {
          title: 'ViBe API Documentation',
          primaryColor: '#3B82F6',
          sidebar: {
            groupStrategy: 'byTagGroup',
            defaultOpenLevel: 0,
          },
        },
      });
      handler(req as any, res as any);
    } catch (error) {
      console.error('Error serving API documentation:', error);
      res
        .status(500)
        .send(`Failed to load API documentation: ${error.message}`);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    Sentry.setupExpressErrorHandler(service);
  }

  const routingControllersOptions = {
    ...options,
    controllers: [
      ...(authModuleOptions.controllers as Function[]),
      ...(coursesModuleOptions.controllers as Function[]),
      ...(usersModuleOptions.controllers as Function[]),
      QuestionController,
    ],
  };

  useExpressServer(service, routingControllersOptions);

  return service;
};

useContainer(Container);

if (!Container.has('Database')) {
  const dbUrl = process.env.DB_URL || dbConfig.url;
  Container.set<IDatabase>('Database', new MongoDatabase(dbUrl, 'vibe'));
}

const TEST_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyTokenValue';

export const main = async () => {
  try {
    const service = ServiceFactory(application, authModuleOptions);
    service.listen(4001, async () => {
      console.log('--------------------------------------------------------');
      console.log('Started Server at http://localhost:4001');
      console.log('--------------------------------------------------------');

      if (process.env.NODE_ENV !== 'production') {
        const quizId = 'quiz123';
        const url = `http://localhost:4001/quizzes/${quizId}/questions`;

        const payload = {
          questionType: 'SML',
          questionText:
            'Select the numbers <QParam>a</QParam> and <QParam>b</QParam> from the following options.',
          hintText:
            'This is a multiple-choice question where multiple answers are correct.',
          difficulty: 2,
          isParameterized: true,
          parameters: {
            parameterName: 'a',
            allowedValued: ['2', '3', '9'],
          },
          lot: {
            lotItems: [
              {
                _id: 'item1',
                text: 'Option 1',
                explaination: 'Explaination as to why this option is correct.',
              },
              {
                _id: 'item2',
                text: 'Option 2',
                explaination:
                  'Explaination as to why this option is incorrect.',
              },
            ],
          },
          solution: {
            SML: {
              itemIds: ['item1', 'item2'],
            },
          },
          metaDetails: {
            isStudentGenerated: true,
            isAIGenerated: false,
          },
          timeLimit: 300,
          points: 20,
        };

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${TEST_AUTH_TOKEN}`,
            },
            body: JSON.stringify(payload),
          });

          const contentType = res.headers.get('content-type');
          console.log('\nTest Response from /quizzes/:quizId/questions');
          console.log('Status:', res.status);

          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            console.log('Body:', data);
          } else {
            const text = await res.text();
            console.error('Unexpected response format:', text);
          }
        } catch (error) {
          console.error('Failed to send test request:', error);
        }
      }
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    throw new Error('Startup failed');
  }
};
