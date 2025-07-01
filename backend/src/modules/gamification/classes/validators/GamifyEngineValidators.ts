import 'reflect-metadata';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import {Type} from 'class-transformer';
import {
  GameMetricType,
  IAchievement,
  IGameMetric,
  IMetricAchievement,
  IUserGameAchievement,
  IUserGameMetric,
} from '#root/shared/index.js';
import {JSONSchema} from 'class-validator-jsonschema';
import {ObjectId} from 'mongodb';

// ==================== GAME METRICS VALIDATORS ====================

/**
 * Validator for creating a new game metric
 */
export class CreateGameMetricBody implements IGameMetric {
  // Name of the metric (e.g., "Points", "Streak")
  @JSONSchema({
    title: 'Game Metric Name',
    description: 'Name for the game metric',
    example: 'points',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  // Optional description explaining what this metric tracks
  @JSONSchema({
    title: 'Game Metric Description',
    description:
      'Description of the metric, explaining its purpose and how it is used in the game',
    example: 'Points earned by the user for completing tasks',
    type: 'string',
  })
  @IsString()
  description?: string;

  // Type of metric (number, streak, etc.)
  @JSONSchema({
    title: 'Game Metric Type',
    description: 'Type of the metric, e.g; number or streak',
    example: 'Number',
    type: 'string',
  })
  @IsNotEmpty()
  @IsEnum(GameMetricType)
  type: GameMetricType;

  // Unit of measurement (e.g., "points", "coins")
  @JSONSchema({
    title: 'Units',
    description: 'unit of the metric, e.g; points, coins, etc.',
    example: 'points',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  units: string;

  // Default amount to increment by when triggered
  @JSONSchema({
    title: 'Default Increment Value',
    description: 'Default value by which the metric is incremented',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  defaultIncrementValue: number;
}

/**
 * Validator for game metric ID parameters
 */
/**
 * Validator for game metric ID parameters
 */
export class GameMetricsParams {
  // MongoDB ID of the metric
  @JSONSchema({
    title: 'Game metric Id.',
    description: 'The mongoId of game Metric.',
    type: 'string',
    example: '68593511b809b47d9b389262',
  })
  @IsNotEmpty()
  @IsMongoId()
  metricId: string;
}

/**
 * Validator for updating an existing game metric
 */
export class updateGameMetric implements Partial<IGameMetric> {
  // MongoDB ID of the metric to update
  @JSONSchema({
    title: 'Game Metric Id',
    description: 'The mongoId of game Metric.',
    type: 'string',
    example: '68593511b809b47d9b389262',
  })
  @IsNotEmpty()
  @IsMongoId()
  metricId: string;

  // Updated name for the metric
  @JSONSchema({
    title: 'Game Metric Name',
    description: 'Name for the game metric',
    example: 'points',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  // Updated description
  @JSONSchema({
    title: 'Game Metric Description',
    description:
      'Description of the metric, explaining its purpose and how it is used in the game',
    example: 'Points earned by the user for completing tasks',
    type: 'string',
  })
  @IsString()
  description?: string;

  // Updated metric type
  @JSONSchema({
    title: 'Game Metric Type',
    description: 'Type of the metric, e.g; number or streak',
    example: 'Number',
    type: 'string',
  })
  @IsNotEmpty()
  @IsEnum(GameMetricType)
  type: GameMetricType;

  // Updated units
  @JSONSchema({
    title: 'Units',
    description: 'unit of the metric, e.g; points, coins, etc.',
    example: 'points',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  units: string;

  // Updated default increment value
  @JSONSchema({
    title: 'Default Increment Value',
    description: 'Default value by which the metric is incremented',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  defaultIncrementValue: number;
}

// ==================== ACHIEVEMENTS VALIDATORS ====================

/**
 * Validator for creating a new achievement
 */
/**
 * Validator for creating a new achievement
 */
export class CreateMetricAchievementBody implements IMetricAchievement {
  // Display name of the achievement
  @JSONSchema({
    title: 'Achievement Name',
    description: 'Name of the achievement',
    example: 'Points Master',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // Description explaining what the achievement is for
  @JSONSchema({
    title: 'Achievement Description',
    description: 'Description of the achievement',
    example: 'Points Master - Awarded for reaching 1000 points',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  // URL to the badge image
  @JSONSchema({
    title: 'Achievement Badge URL',
    description: 'URL of the badge image for the achievement',
    example: 'https://example.com/badge.png',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  badgeUrl: string;

  // Type of trigger (currently only 'metric')
  @JSONSchema({
    title: 'Achievement Trigger',
    description: 'Trigger type for the achievement, e.g; metric',
    example: 'metric',
    type: 'string',
    enum: ['metric'],
  })
  @IsString()
  @IsNotEmpty()
  trigger: 'metric';

  // ID of the metric this achievement tracks
  @JSONSchema({
    title: 'Metric ID',
    description: 'The ID of the metric associated with the achievement',
    example: '68593511b809b47d9b389262',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  metricId: string;

  // Threshold value needed to unlock this achievement
  @JSONSchema({
    title: 'Achievement Value',
    description: 'The value required to trigger the achievement',
    example: 1000,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  metricCount: number;
}

/**
 * Validator for achievement ID parameters
 */
/**
 * Validator for achievement ID parameters
 */
export class AchievementParams {
  // MongoDB ID of the achievement
  @JSONSchema({
    title: 'Achievement Id.',
    description: 'The mongoId of game Achievement.',
    type: 'string',
    example: '68593511b809b47d9b389262',
  })
  @IsNotEmpty()
  @IsMongoId()
  achievementId: string;
}

/**
 * Validator for updating an existing achievement
 */
export class UpdateMetricAchievementBody
  implements Partial<IMetricAchievement>
{
  // MongoDB ID of the achievement to update
  @JSONSchema({
    title: 'Achievement Id',
    description: 'The mongoId of game Achievement.',
    type: 'string',
    example: '68593511b809b47d9b389262',
  })
  @IsNotEmpty()
  @IsMongoId()
  achievementId: string;

  // Updated achievement name
  @JSONSchema({
    title: 'Achievement Name',
    description: 'Name of the achievement',
    example: 'Points Master',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // Updated achievement description
  @JSONSchema({
    title: 'Achievement Description',
    description: 'Description of the achievement',
    example: 'Points Master - Awarded for reaching 1000 points',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  // Updated badge URL
  @JSONSchema({
    title: 'Achievement Badge URL',
    description: 'URL of the badge image for the achievement',
    example: 'https://example.com/badge.png',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  badgeUrl: string;

  // Updated trigger type
  @JSONSchema({
    title: 'Achievement Trigger',
    description: 'Trigger type for the achievement, e.g; metric',
    example: 'metric',
    type: 'string',
    enum: ['metric'],
  })
  @IsString()
  @IsNotEmpty()
  trigger: 'metric';

  // Updated metric ID
  @JSONSchema({
    title: 'Metric ID',
    description: 'The ID of the metric associated with the achievement',
    example: '68593511b809b47d9b389262',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  metricId: string;

  // Updated threshold value
  @JSONSchema({
    title: 'Achievement Value',
    description: 'The value required to trigger the achievement',
    example: 1000,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  metricCount: number;
}

/**
 * Validator for individual achievement data
 */
export class Achievement implements IAchievement {
  // ID of the achievement
  @IsMongoId()
  achievementId: string | ObjectId;

  // When the achievement was unlocked
  @IsString()
  unlockedAt: Date;
}

// ==================== USER ACHIEVEMENTS VALIDATORS ====================

/**
 * Validator for creating user achievement collections
 */
/**
 * Validator for creating user achievement collections
 */
export class CreateUserGameAchievementBody
  implements Partial<IUserGameAchievement>
{
  // ID of the user who owns these achievements
  @JSONSchema({
    title: 'User ID',
    description: 'Unique identifier for the user who achieved this',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  // Array of achievements earned by the user
  @JSONSchema({
    title: 'Achievements',
    description: 'List of achievements earned by the user',
    type: 'array',
    items: {
      $ref: '#/definitions/IAchievement',
    },
  })
  @IsArray()
  @ValidateNested()
  @Type(() => Achievement)
  achievements?: Achievement[] | [];
}

/**
 * Validator for user achievement query parameters
 */
export class GetUserGameAchievementParams {
  // User ID for querying achievements
  @JSONSchema({
    title: 'UserId',
    description:
      'The mongoId of the user whose achievements are being queried.',
    type: 'string',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

/**
 * Validator for deleting user achievements
 */
export class DeleteUserGameAchievementParams {
  // User ID
  @JSONSchema({
    title: 'UserId',
    description:
      'The mongoId of the user whose achievements are being deleted.',
    type: 'string',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  // Achievement ID to remove
  @JSONSchema({
    title: 'AchievementId',
    description:
      "The mongoId of the achievement to be deleted from the user's achievements.",
    type: 'string',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
  })
  @IsNotEmpty()
  @IsMongoId()
  achievementId: string;
}

/**
 * Validator for updating user achievements
 */
export class UpdateUserGameAchievementBody
  implements Partial<IUserGameAchievement>
{
  // User ID
  @JSONSchema({
    title: 'User ID',
    description: 'Unique identifier for the user who achieved this',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  // Updated achievements array
  @JSONSchema({
    title: 'Achievements',
    description: 'List of achievements earned by the user',
    type: 'array',
  })
  @IsArray()
  @ValidateNested()
  @Type(() => Achievement)
  achievements?: Achievement[] | [];
}

// ==================== USER GAME METRICS VALIDATORS ====================

/**
 * Validator for user game metric data
 */
/**
 * Validator for user game metric data
 */
export class UserGameMetricBody implements IUserGameMetric {
  // ID of the user who owns this metric
  @JSONSchema({
    title: 'User ID',
    description: 'Unique identifier for the user who owns this metric',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string | ObjectId;

  // ID of the metric being tracked
  @JSONSchema({
    title: 'Metric ID',
    description: 'Unique identifier for the metric',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  metricId: string | ObjectId;

  // Current value/count for this metric
  @JSONSchema({
    title: 'Metric Value',
    description: 'Current value of the metric for the user',
    example: 100,
    type: 'number',
  })
  @IsNumber()
  value: number;

  // When this metric was last updated
  @JSONSchema({
    title: 'Last Updated',
    description: 'Timestamp of the last update to the metric',
    example: '2023-10-01T12:00:00Z',
    type: 'string',
  })
  @IsString()
  lastUpdated: Date;
}

/**
 * Validator for user metrics query parameters
 */
export class ReadUserGameMetricsParams {
  // User ID for querying metrics
  @JSONSchema({
    title: 'User ID',
    description: 'The mongoId of the user whose metrics are being queried.',
    type: 'string',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

/**
 * Validator for updating user game metrics
 */
export class UpdateUserGameMetricBody implements Partial<IUserGameMetric> {
  // User ID
  @JSONSchema({
    title: 'User ID',
    description: 'Unique identifier for the user who owns this metric',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string | ObjectId;

  // Metric ID
  @JSONSchema({
    title: 'Metric ID',
    description: 'Unique identifier for the metric',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  metricId: string | ObjectId;

  // Updated metric value
  @JSONSchema({
    title: 'Metric Value',
    description: 'Updated value of the metric for the user',
    example: 150,
    type: 'number',
  })
  @IsNumber()
  value: number;

  // Update timestamp
  @JSONSchema({
    title: 'Last Updated',
    description: 'Timestamp of the last update to the metric',
    example: '2023-10-01T12:00:00Z',
    type: 'string',
  })
  lastUpdated: Date;
}

/**
 * Validator for deleting user game metrics
 */
export class DeleteUserGameMetricParams {
  // User ID
  @JSONSchema({
    title: 'User ID',
    description: 'The mongoId of the user whose metric is being deleted.',
    type: 'string',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  // Metric ID to delete
  @JSONSchema({
    title: 'Metric ID',
    description: 'The mongoId of the metric to be deleted from the user.',
    type: 'string',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
  })
  @IsNotEmpty()
  @IsMongoId()
  metricId: string;
}

// ==================== METRIC TRIGGER VALIDATORS ====================

/**
 * Validator for individual metric updates in a trigger
 */
export class MetricTriggerItemValidator {
  // ID of the metric to update
  @JSONSchema({
    description: 'Metric ID to update',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @IsMongoId()
  @IsNotEmpty()
  metricId: string;

  // Amount to increment the metric by
  @JSONSchema({
    description: 'Value to increment',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  value: number;
}

/**
 * Validator for metric trigger requests
 */
export class MetricTriggerValidator {
  // User ID whose metrics to update
  @JSONSchema({
    description: 'User ID',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  // Array of metrics to update
  @JSONSchema({
    description: 'Metrics to update',
    type: 'array',
    items: {$ref: '#/components/schemas/MetricTriggerItem'},
  })
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => MetricTriggerItemValidator)
  metrics: MetricTriggerItemValidator[];
}
