import { Container, ContainerModule } from 'inversify';
import { TempController } from './controllers/TempController.js';import { sharedContainerModule } from '#root/container.js';
import { InversifyAdapter } from '#root/inversify-adapter.js';
import { useContainer, RoutingControllersOptions } from 'routing-controllers';
import { tempContainerModule } from './container.js';

export const tempContainerModules: ContainerModule[] = [
  tempContainerModule,
  sharedContainerModule,
];

export const tempModuleControllers: Function[] = [
  TempController,
];

export async function setupTempContainer(): Promise<void> {
  const container = new Container();
  await container.load(...tempContainerModules);
  const inversifyAdapter = new InversifyAdapter(container);
  useContainer(inversifyAdapter);
}

export const tempModuleOptions: RoutingControllersOptions = {
  controllers: tempModuleControllers,
  middlewares: [],
  defaultErrorHandler: true,
  authorizationChecker: async function () {
    return true;
  },
  validation: true,
};
