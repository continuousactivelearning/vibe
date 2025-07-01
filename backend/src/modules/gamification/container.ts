import {ContainerModule} from 'inversify';
import {GAMIFICATION_TYPES} from './types.js';
import {GamifyEngineController} from './controllers/GamifyEngineController.js';
import {
  UserGameMetricsService,
  UserGameAchievementsService,
  AchievementService,
  MetricService,
  MetricTriggerService,
  EventService,
  RuleService,
} from './services/index.js';
import {GamifyLayerController} from './controllers/GamifyLayerController.js';

export const GamificationContainerModule = new ContainerModule(options => {
  // Service
  options.bind(GAMIFICATION_TYPES.MetricService).to(MetricService);
  options.bind(GAMIFICATION_TYPES.AchievementService).to(AchievementService);
  options
    .bind(GAMIFICATION_TYPES.UserGameAchievementsService)
    .to(UserGameAchievementsService);
  options
    .bind(GAMIFICATION_TYPES.UserGameMetricsService)
    .to(UserGameMetricsService);
  options
    .bind(GAMIFICATION_TYPES.MetricTriggerService)
    .to(MetricTriggerService);
  options.bind(GAMIFICATION_TYPES.EventService).to(EventService);
  options.bind(GAMIFICATION_TYPES.RuleService).to(RuleService);

  // controllers
  options.bind(GamifyEngineController).toSelf().inSingletonScope();
  options.bind(GamifyLayerController).toSelf().inSingletonScope();
});
