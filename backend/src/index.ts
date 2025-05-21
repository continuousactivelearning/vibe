if (process.env.NODE_ENV === 'production') {
  import('./instrument');
}
import Express from 'express';
import Sentry from '@sentry/node';
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
import {app} from 'firebase-admin';
import {
  authModuleOptions,
  coursesModuleOptions,
  genaiVideoRouter /*, usersModuleOptions */,
} from 'modules';

export const application = Express();

export const ServiceFactory = (
  service: typeof application,
  options: RoutingControllersOptions,
): typeof application => {
  console.log('--------------------------------------------------------');
  console.log('Initializing service server');
  console.log('--------------------------------------------------------');

  service.use(Express.urlencoded({extended: true}));
  service.use(Express.json());

  console.log('--------------------------------------------------------');
  console.log('Logging and Configuration Setup');
  console.log('--------------------------------------------------------');

  service.use(loggingHandler);

  // Mount the GenAI Express router before other specific routing if preferred, or after general middleware
  service.use('/genai', genaiVideoRouter);

  console.log('--------------------------------------------------------');
  console.log('Define Routing');
  console.log('--------------------------------------------------------');
  service.get('/main/healthcheck', (req, res) => {
    res.send('Hello World');
  });

  console.log('--------------------------------------------------------');
  console.log('Routes Handler');
  console.log('--------------------------------------------------------');
  //After Adding Routes
  if (process.env.NODE_ENV === 'production') {
    Sentry.setupExpressErrorHandler(service);
  }

  console.log('--------------------------------------------------------');
  console.log('Starting Server');
  console.log('--------------------------------------------------------');

  useExpressServer(service, options);

  return service;
};

// Create a main function where multiple services are created

useContainer(Container);

if (!Container.has('Database')) {
  Container.set<IDatabase>('Database', new MongoDatabase(dbConfig.url, 'vibe'));
}

export const main = () => {
  const collectedControllers: Function[] = [];

  const addControllers = (
    moduleOptions: RoutingControllersOptions | undefined,
  ) => {
    if (moduleOptions && moduleOptions.controllers) {
      moduleOptions.controllers.forEach(controller => {
        if (typeof controller === 'function') {
          collectedControllers.push(controller);
        } else {
          // Optionally log if a controller is not a function, as it might indicate an issue.
          console.warn(`Skipping non-function controller: ${controller}`);
        }
      });
    }
  };

  addControllers(authModuleOptions);
  addControllers(coursesModuleOptions); // Assuming coursesModuleOptions is correctly imported and has controllers
  // addControllers(usersModuleOptions); // Uncomment if usersModuleOptions is available and needed

  const routingOptions: RoutingControllersOptions = {
    ...(authModuleOptions || {}),
    controllers: collectedControllers,
  };

  const service = ServiceFactory(application, routingOptions);
  service.listen(4001, () => {
    console.log('--------------------------------------------------------');
    console.log('Started Server at http://localhost:' + 4001);
    console.log('--------------------------------------------------------');
  });
};

main();
