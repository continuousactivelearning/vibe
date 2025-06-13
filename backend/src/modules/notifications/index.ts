import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware,
  useContainer,
} from 'routing-controllers';
import {RoutingControllersOptions} from 'routing-controllers';
import {Container, Service} from 'typedi';
import {MongoDatabase} from 'shared/database/providers/mongo/MongoDatabase';
import {EnrollmentRepository} from 'shared/database/providers/mongo/repositories/EnrollmentRepository';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {UserRepository} from 'shared/database/providers/MongoDatabaseProvider';
import {InviteRepository} from 'shared/database/providers/mongo/repositories/InviteRepository';
import {dbConfig} from '../../config/db.js';
import {InviteService, MailService} from './services/index.js';
import {InviteController} from './controllers/index.js';
useContainer(Container);

export function setupNotificationsModuleDependencies(): void {
  if (!Container.has('Database')) {
    Container.set('Database', new MongoDatabase(dbConfig.url, 'vibe'));
  }

  if (!Container.has('EnrollmentRepo')) {
    Container.set(
      'EnrollmentRepo',
      new EnrollmentRepository(Container.get<MongoDatabase>('Database')),
    );
  }
  if (!Container.has('CourseRepo')) {
    Container.set(
      'CourseRepo',
      new CourseRepository(Container.get<MongoDatabase>('Database')),
    );
  }
  if (!Container.has('UserRepo')) {
    Container.set(
      'UserRepo',
      new UserRepository(Container.get<MongoDatabase>('Database')),
    );
  }
  if (!Container.has('InviteRepo')) {
    Container.set(
      'InviteRepo',
      new InviteRepository(Container.get<MongoDatabase>('Database')),
    );
  }
  if (!Container.has('MailService')) {
    Container.set('MailService', new MailService());
  }

  if (!Container.has('InviteService')) {
    Container.set(
      'InviteService',
      new InviteService(
        Container.get<InviteRepository>('InviteRepo'),
        Container.get<UserRepository>('UserRepo'),
        Container.get<CourseRepository>('CourseRepo'),
        Container.get<EnrollmentRepository>('EnrollmentRepo'),
        Container.get<MailService>('MailService'),
      ),
    );
  }
}
setupNotificationsModuleDependencies();
export const notificationsModuleOptions: RoutingControllersOptions = {
  controllers: [InviteController],
};
export * from './controllers/index.js';
export {InviteController};
