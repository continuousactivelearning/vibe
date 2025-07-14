const GAMIFICATION_TYPES = {
  // Services
  MetricService: Symbol.for('MetricService'),
  AchievementService: Symbol.for('AchievementService'),
  ScoringService: Symbol.for('ScoringService'),

  UserGameAchievementsService: Symbol.for('UserGameAchievementsService'),
  UserGameMetricsService: Symbol.for('UserGameMetricsService'),
  MetricTriggerService: Symbol.for('MetricTriggerService'),
  EventService: Symbol.for('EventService'),
  RuleService: Symbol.for('RuleService'),

  // Repositories
  GamifyEngineRepository: Symbol.for('GamifyEngineRepository'),
  WeightsRepo: Symbol.for('ScoringWeightsRepository'),
  GamifyLayerRepository: Symbol.for('GamifyLayerRepository'),
};

const QUIZZES_TYPES = {
  SubmissionRepo: Symbol.for('SubmissionRepository')
};
export {GAMIFICATION_TYPES,QUIZZES_TYPES};


