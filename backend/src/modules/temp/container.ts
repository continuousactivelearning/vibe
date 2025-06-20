import { ContainerModule } from 'inversify';
import { TempController } from './controllers/TempController.js';import { TEMP_TYPES } from './types.js';

export const tempContainerModule = new ContainerModule(options => {
  options.bind(TempController).toSelf().inSingletonScope();

  // Repositories

  // Services

  // Controllers
});
