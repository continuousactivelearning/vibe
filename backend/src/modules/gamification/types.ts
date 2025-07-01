const TYPES = {
  // Services
  MetricService: Symbol.for('MetricService'),
  AchievementService: Symbol.for('AchievementService'),
  UserGameAchievementsService: Symbol.for('UserGameAchievementsService'),
  UserGameMetricsService: Symbol.for('UserGameMetricsService'),
  MetricTriggerService: Symbol.for('MetricTriggerService'),
  EventService: Symbol.for('EventService'),
  RuleService: Symbol.for('RuleService'),

  // Repositories
  GamifyEngineRepository: Symbol.for('GamifyEngineRepository'),
  GamifyLayerRepository: Symbol.for('GamifyLayerRepository'),
};

export {TYPES as GAMIFICATION_TYPES};
