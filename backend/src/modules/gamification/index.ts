import {sharedContainerModule} from '#root/container.js';
import {Container, ContainerModule} from 'inversify';
import {authContainerModule} from '../auth/container.js';
import {GamificationContainerModule} from './container.js';
import {InversifyAdapter} from '#root/inversify-adapter.js';
import {useContainer} from 'class-validator';
import { ScoreController } from '#root/modules/gamification/controllers/ScoreController.js';
import {GamifyEngineController} from './controllers/GamifyEngineController.js';
import {HttpErrorHandler} from '#root/shared/index.js';
import { SCORING_VALIDATORS } from '#gamification/classes/validators/ScoringValidators.js';
import {GamifyLayerController} from './controllers/GamifyLayerController.js';

export const gamificationModuleControllers: Function[] = [
  GamifyEngineController,
  ScoreController,
  GamifyLayerController,
];

export const gamificationContainerModules: ContainerModule[] = [
  GamificationContainerModule,
  sharedContainerModule,
  authContainerModule,
];

export function setupGamificationContainer() {
  const container = new Container();
  container.load(...gamificationContainerModules);
  const inversifyAdapter = new InversifyAdapter(container);
  useContainer(inversifyAdapter);
  return container;
}

export const gamificationModuleOptions = {
  controllers: gamificationModuleControllers,
  Middleware: [HttpErrorHandler],
  defaultErrorHandler: false,
  authorizationChecker: async function () {
    return true;
  },
  validation: true,
};

export const gamificationModuleValidators: Function[] = [
  ...SCORING_VALIDATORS,
];

export * from './classes/index.js';
export * from './controllers/index.js';
export * from './services/index.js';
export * from './types.js';
export * from './container.js';
export * from './interfaces/index.js';