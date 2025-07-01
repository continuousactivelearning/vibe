import 'reflect-metadata';
import {Expose, Transform, Type} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';
import {
  ID,
  IMetricTrigger,
  IMetrics,
  IMetricTriggerResponse,
  IAchievement,
} from '#shared/index.js';
import {JSONSchema} from 'class-validator-jsonschema';
import {
  MetricTriggerValidator,
  MetricTriggerItemValidator,
  Achievement,
} from '#gamification/classes/validators/GamifyEngineValidators.js';
import {ValidateNested} from 'class-validator';

/**
 * MetricTriggerItem class - represents a single metric update
 * Used to specify which metric to update and by how much
 */
export class MetricTriggerItem implements IMetrics {
  // ID of the metric to update
  @Expose()
  @JSONSchema({
    description: 'Metric ID to update',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  metricId: ID;

  // Amount to increment the metric by
  @Expose()
  @JSONSchema({
    description: 'Value to increment',
    example: 1,
    type: 'number',
  })
  value?: number;

  /**
   * Constructor - creates a new MetricTriggerItem
   * @param body - Optional data to populate the trigger item
   */
  constructor(body?: MetricTriggerItemValidator) {
    if (body) {
      this.metricId = body.metricId;
      this.value = body.value;
    }
  }
}

/**
 * AchievementTriggerItem class - represents an achievement that was unlocked
 * Used in responses to show which achievements were triggered
 */
export class AchievementTriggerItem implements IAchievement {
  // ID of the achievement that was unlocked
  @Expose()
  @JSONSchema({
    description: 'Achievement ID',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  achievementId: ID;

  // When the achievement was unlocked
  @Expose()
  @JSONSchema({
    description: 'Date when the achievement was unlocked',
    example: '2023-10-01T00:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  unlockedAt: Date;

  /**
   * Constructor - creates a new AchievementTriggerItem
   * @param body - Optional data to populate the achievement item
   */
  constructor(body?: Achievement) {
    if (body) {
      this.achievementId = body.achievementId;
      this.unlockedAt = body.unlockedAt;
    }
  }
}

/**
 * MetricTrigger class - request body to trigger gamification engine
 * Contains user ID and array of metrics to update
 */
export class MetricTrigger implements IMetricTrigger {
  // ID of the user whose metrics should be updated
  @Expose()
  @JSONSchema({
    description: 'User ID',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  userId: ID;

  // Array of metrics to update for this user
  @Expose()
  @JSONSchema({
    description: 'Metrics to update',
    type: 'array',
    items: {$ref: '#/components/schemas/MetricTriggerItem'},
  })
  @Type(() => MetricTriggerItem)
  metrics: MetricTriggerItem[];

  /**
   * Constructor - creates a new MetricTrigger request
   * @param body - Optional data to populate the trigger
   */
  constructor(body?: MetricTriggerValidator) {
    if (body) {
      this.userId = body.userId;
      this.metrics = (body.metrics || []).map(
        metric => new MetricTriggerItem(metric),
      );
    }
  }
}

/**
 * MetricTriggerResponse class - response after triggering metrics
 * Contains updated metrics and any achievements that were unlocked
 */
export class MetricTriggerResponse implements IMetricTriggerResponse {
  // List of metrics that were updated
  @Expose()
  @JSONSchema({
    title: 'Updated Metrics',
    description: 'List of updated metrics',
    type: 'array',
  })
  @ValidateNested()
  @Type(() => MetricTriggerItem)
  metricsUpdated: MetricTriggerItem[];

  // List of achievements that were unlocked as a result
  @Expose()
  @JSONSchema({
    title: 'Unlocked Achievements',
    description: 'List of unlocked achievements',
    type: 'array',
  })
  @ValidateNested()
  @Type(() => AchievementTriggerItem)
  achievementsUnlocked: AchievementTriggerItem[];

  /**
   * Constructor - creates a new MetricTriggerResponse
   * @param data - Optional data to populate the response
   */
  constructor(data?: Partial<IMetricTriggerResponse>) {
    if (data) {
      this.metricsUpdated = data.metricsUpdated || [];
      this.achievementsUnlocked = data.achievementsUnlocked || [];
    }
  }
}
