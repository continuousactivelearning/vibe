import {ContainerModule} from 'inversify';
import {GAMIFICATION_TYPES} from './types.js';
import {GamifyEngineController} from './controllers/GamifyEngineController.js';
import {
  userGameMetricsService,
  userGameAchievementsService,
  achievementService,
  metricService,
  metricTriggerService,
  eventService,
  ruleService,
} from './services/index.js';
import {GamifyLayerController} from './controllers/GamifyLayerController.js';

export const GamificationContainerModule = new ContainerModule(options => {
  // Service
  options.bind(GAMIFICATION_TYPES.MetricService).to(metricService);
  options.bind(GAMIFICATION_TYPES.AchievementService).to(achievementService);
  options
    .bind(GAMIFICATION_TYPES.UserGameAchievementsService)
    .to(userGameAchievementsService);
  options
    .bind(GAMIFICATION_TYPES.UserGameMetricsService)
    .to(userGameMetricsService);
  options
    .bind(GAMIFICATION_TYPES.MetricTriggerService)
    .to(metricTriggerService);
  options.bind(GAMIFICATION_TYPES.EventService).to(eventService);
  options.bind(GAMIFICATION_TYPES.RuleService).to(ruleService);

  // controllers
  options.bind(GamifyEngineController).toSelf().inSingletonScope();
  options.bind(GamifyLayerController).toSelf().inSingletonScope();
});
