import {authContainerModule} from '#auth/container.js';
import {sharedContainerModule} from '#root/container.js';
import {InversifyAdapter} from '#root/inversify-adapter.js';
import {Container, ContainerModule} from 'inversify';
import {RoutingControllersOptions, useContainer} from 'routing-controllers';
import {settingsContainerModule} from './container.js';
import {CourseSettingsController} from './controllers/index.js';
import {UserSettingsController} from './controllers/UserSettingsController.js';
import {HttpErrorHandler} from '#root/shared/index.js';

export const settingsContainerModules: ContainerModule[] = [
  sharedContainerModule,
  authContainerModule,
  settingsContainerModule,
];

export const settingsModuleControllers: Function[] = [
  CourseSettingsController,
  UserSettingsController,
];

export async function setupSettingsContainer(): Promise<void> {
  const container = new Container();
  await container.load(...settingsContainerModules);
  const inversifyAdapter = new InversifyAdapter(container);
  useContainer(inversifyAdapter);
}

export const settingsModuleOptions = {
  controllers: [settingsModuleControllers],
  middlewares: [HttpErrorHandler],
  defaultErrorHandler: false,
  authorizationChecker: async function () {
    return true;
  },
  validation: true,
};

export * from './classes/index.js';
export * from './controllers/index.js';
export * from './services/index.js';
export * from './types.js';
export * from './container.js';
