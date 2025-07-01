import 'reflect-metadata';
import {Expose, Transform} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';
import {ID, Trigger} from '#shared/index.js';
import {IMetricAchievement} from '#shared/index.js';
import {JSONSchema} from 'class-validator-jsonschema';
import {CreateMetricAchievementBody} from '../validators/GamifyEngineValidators.js';

/**
 * MetricAchievement class - represents an achievement that users can unlock
 * when they reach a specific metric threshold (e.g., "First 100 Points")
 */
export class MetricAchievement implements IMetricAchievement {
  // Unique database identifier for this achievement
  @Expose()
  @JSONSchema({
    title: 'Unique Identifier',
    description: 'MongoDB ObjectId of the metric achievement',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  // Display name of the achievement
  @Expose()
  @JSONSchema({
    title: 'Name of the Metric Achievement',
    description: 'Name of the metric achievement, e.g; "First 100 Points"',
    example: 'First 100 Points',
    type: 'string',
  })
  name: string;

  // Detailed description explaining what the achievement is for
  @Expose()
  @JSONSchema({
    title: 'description',
    description:
      'Description of the metric achievement, explaining its purpose and how it is used in the game',
    example: 'Earned by the user for completing the first 100 points',
    type: 'string',
  })
  description: string;

  // URL to the badge image displayed when achievement is unlocked
  @Expose()
  @JSONSchema({
    title: 'Badge URL',
    description: 'URL of the badge image for the metric achievement',
    example: 'https://example.com/badge.png',
    type: 'string',
  })
  badgeUrl: string;

  // Type of trigger that unlocks this achievement
  @Expose()
  @JSONSchema({
    title: 'Trigger Type',
    description: 'Type of trigger for the metric achievement, e.g; "metric"',
    example: 'metric',
    type: 'string',
  })
  trigger: Trigger;

  // Reference to the metric that this achievement tracks
  @Expose()
  @JSONSchema({
    title: 'metricId',
    description: 'MongoDB ObjectId of the metric to track for this achievement',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  metricId: ID;

  // Threshold value needed to unlock this achievement
  @Expose()
  @JSONSchema({
    title: 'Metric Count',
    description: 'The count of the metric required to achieve this Achievement',
    example: 100,
    type: 'number',
  })
  metricCount: number;

  /**
   * Constructor - creates a new MetricAchievement instance
   * @param achievementBody - Optional data to populate the achievement
   */
  constructor(achievementBody?: CreateMetricAchievementBody) {
    if (achievementBody) {
      this.name = achievementBody.name;
      this.description = achievementBody.description;
      this.badgeUrl = achievementBody.badgeUrl;
      this.trigger = achievementBody.trigger;
      this.metricId = achievementBody.metricId;
      this.metricCount = achievementBody.metricCount;
    }
  }
}
