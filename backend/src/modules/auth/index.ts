import {Container} from 'inversify';
import {sharedContainerModule} from '#root/container.js';
import {InversifyAdapter} from '#root/inversify-adapter.js';
import {
  RoutingControllersOptions,
  Action,
  useContainer,
  getFromContainer,
} from 'routing-controllers';
import {authContainerModule} from './container.js';
import {AuthController} from './controllers/AuthController.js';
import {FirebaseAuthService} from './services/FirebaseAuthService.js';

export async function setupAuthContainer(): Promise<void> {
  const container = new Container();
  await container.load(sharedContainerModule, authContainerModule);
  const inversifyAdapter = new InversifyAdapter(container);
  useContainer(inversifyAdapter);
  /**
   * @file index.ts
   * @description This file exports all the DTOs used in the auth module.
   * @module auth
   *
   * @author Aditya BMV
   * @organization DLED
   * @license MIT
   * @created 2025-03-06
   */

  import 'reflect-metadata';
  import {Action, RoutingControllersOptions} from 'routing-controllers';
  import {AuthController} from './controllers/AuthController.js';
  import {Container} from 'typedi';
  import {useContainer} from 'routing-controllers';
  import {IAuthService} from './interfaces/IAuthService.js';
  import {FirebaseAuthService} from './services/FirebaseAuthService.js';

  import {dbConfig} from '../../config/db.js';
  import {IDatabase, IInviteRepository, IUserRepository} from 'shared/database';
  import {
    EnrollmentRepository,
    InviteRepository,
    MongoDatabase,
    UserRepository,
  } from 'shared/database/providers/MongoDatabaseProvider';
  import {Invite} from 'modules/courses/classes/transformers/Invite';
  import {MailService} from 'modules/notifications/services';

  useContainer(Container);

  export function setupAuthModuleDependencies(): void {
    if (!Container.has('Database')) {
      Container.set<IDatabase>(
        'Database',
        new MongoDatabase(dbConfig.url, 'vibe'),
      );
    }

    if (!Container.has('UserRepository')) {
      Container.set<IUserRepository>(
        'UserRepository',
        new UserRepository(Container.get<MongoDatabase>('Database')),
      );
    }
    if (!Container.has('InviteRepository')) {
      Container.set<IInviteRepository>(
        'InviteRepository',
        new InviteRepository(Container.get<MongoDatabase>('Database')),
      );
    }
    if (!Container.has('EnrollmentRepository')) {
      Container.set<EnrollmentRepository>(
        'EnrollmentRepository',
        new EnrollmentRepository(Container.get<MongoDatabase>('Database')),
      );
    }
    if (!Container.has('MailService')) {
      Container.set('MailService', new MailService());
    }
    if (!Container.has('AuthService')) {
      Container.set<IAuthService>(
        'AuthService',
        new FirebaseAuthService(
          Container.get<EnrollmentRepository>('EnrollmentRepository'),
          Container.get<IUserRepository>('UserRepository'),
          Container.get<IInviteRepository>('InviteRepository'),
          Container.get<MailService>('MailService'),
        ),
      );
    }
  }

  export const authModuleOptions: RoutingControllersOptions = {
    controllers: [AuthController],
    authorizationChecker: async function (action: Action, roles: string[]) {
      // Use the auth service to check if the user is authorized
      const authService =
        getFromContainer<FirebaseAuthService>(FirebaseAuthService);
      const token = action.request.headers['authorization']?.split(' ')[1];
      if (!token) {
        return false;
      }

      try {
        const user = await authService.verifyToken(token);
        action.request.user = user;

        // Check if the user's roles match the required roles
        if (
          roles.length > 0 &&
          !roles.some(role => user.roles.includes(role))
        ) {
          return false;
        }

        return true;
      } catch (error) {
        return false;
      }
    },
    currentUserChecker: async (action: Action) => {
      // Use the auth service to get the current user
      const authService =
        getFromContainer<FirebaseAuthService>(FirebaseAuthService);
      const token = action.request.headers['authorization']?.split(' ')[1];
      if (!token) {
        return null;
      }
      try {
        return await authService.verifyToken(token);
      } catch (error) {
        return null;
      }
    },
  };
}

export * from './classes/index.js';
export * from './controllers/index.js';
export * from './interfaces/index.js';
export * from './services/index.js';
export * from './container.js';
export * from './types.js';
