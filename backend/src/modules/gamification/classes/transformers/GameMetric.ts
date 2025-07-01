import 'reflect-metadata';
import {Expose, Transform} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';
import {ID} from '#shared/index.js';
import {GameMetricType, IGameMetric} from '#shared/interfaces/models.js';
import {JSONSchema} from 'class-validator-jsonschema';
import {CreateGameMetricBody} from '../validators/index.js';

/**
 * GameMetric class - represents a trackable metric in the gamification system
 * (e.g., points, coins, streak count, etc.)
 */
class GameMetric implements IGameMetric {
  // Unique database identifier for this metric
  @Expose()
  @JSONSchema({
    title: 'Game Metric ID',
    description: 'Unique identifier for the game metric',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  // Display name of the metric
  @Expose()
  @JSONSchema({
    title: 'Metric Name',
    description: 'Name of the Metric',
    example: 'Points',
    type: 'string',
  })
  name: string;

  // Optional description explaining what this metric tracks
  @Expose()
  @JSONSchema({
    title: 'Metric Description',
    description:
      'Description of the metric, explaining its purpose and how it is used in the game',
    example: 'Points earned by the user for completing tasks',
    type: 'string',
  })
  description?: string;

  // Type of metric (number, streak, etc.)
  @Expose()
  @JSONSchema({
    title: 'Metric Type',
    description: 'Type of the metric, e.g; number or streak',
    example: 'Number',
    type: 'string',
  })
  type: GameMetricType;

  // Unit of measurement for this metric
  @Expose()
  @JSONSchema({
    title: 'Units',
    description: 'unit of the metric, e.g; points, coins, etc.',
    example: 'points',
    type: 'string',
  })
  units: string;

  // Default amount to increase metric by when triggered
  @Expose()
  @JSONSchema({
    title: 'defaultIncrementValue',
    description: 'default value by which the metric is incremented, e.g; 10',
    example: '10',
    type: 'number',
  })
  defaultIncrementValue: number;

  /**
   * Constructor - creates a new GameMetric instance
   * @param gameMetricBody - Optional data to populate the metric
   */
  constructor(gameMetricBody?: CreateGameMetricBody) {
    if (gameMetricBody) {
      this.name = gameMetricBody.name;
      this.description = gameMetricBody.description;
      this.type = gameMetricBody.type;
      this.units = gameMetricBody.units;
      this.defaultIncrementValue = gameMetricBody.defaultIncrementValue;
    }
  }
}

/**
 * GameMetricResponse class - plain object response for API endpoints
 * Contains the same data as GameMetric but without decorators
 */
class GameMetricResponse implements IGameMetric {
  _id?: string;
  name: string;
  description?: string;
  type: GameMetricType;
  units: string;
  defaultIncrementValue: number;

  /**
   * Constructor - creates a response object from a GameMetric
   * @param gameMetric - The GameMetric instance to convert
   */
  constructor(gameMetric: GameMetric) {
    if (gameMetric) {
      this._id = gameMetric._id.toString();
      this.name = gameMetric.name;
      this.description = gameMetric.description;
      this.type = gameMetric.type;
      this.units = gameMetric.units;
      this.defaultIncrementValue = gameMetric.defaultIncrementValue;
    }
  }
}
export {GameMetric, GameMetricResponse};
