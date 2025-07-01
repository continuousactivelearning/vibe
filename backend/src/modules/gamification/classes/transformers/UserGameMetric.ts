import 'reflect-metadata';
import {Expose, Transform} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';
import {ID, IUserGameMetric} from '#shared/index.js';
import {JSONSchema} from 'class-validator-jsonschema';
import {UserGameMetricBody} from '../validators/GamifyEngineValidators.js';

/**
 * UserGameMetric class - tracks a user's progress on a specific game metric
 * (e.g., how many points a user has earned, their current streak, etc.)
 */
export class UserGameMetric implements IUserGameMetric {
  // Unique database identifier for this user metric record
  @Expose()
  @JSONSchema({
    title: 'User Game Metric ID',
    description: 'Unique identifier for the user game metric',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  // Reference to the user who owns this metric
  @JSONSchema({
    title: 'User ID',
    description: 'Unique identifier for the user who owns this metric',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  userId: ID;

  // Reference to the game metric being tracked
  @JSONSchema({
    title: 'Metric ID',
    description:
      'Unique identifier for the game metric this user metric is associated with',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  metricId: ID;

  // Current value/count for this user's metric
  @JSONSchema({
    title: 'value',
    description:
      'The value count for the user game metric, e.g; number of points earned',
    type: 'number',
    nullable: true,
  })
  value: number;

  // When this metric was last updated
  @JSONSchema({
    title: 'lastUpdated',
    description:
      'Timestamp of the last update to this user game metric, in ISO format',
    type: 'string',
    nullable: true,
  })
  lastUpdated: Date;

  /**
   * Constructor - creates a new UserGameMetric instance
   * @param body - Optional data to populate the user metric
   */
  constructor(body?: UserGameMetricBody) {
    if (body) {
      this.userId = body.userId;
      this.metricId = body.metricId;
      this.value = body.value;
      this.lastUpdated = body.lastUpdated
        ? new Date(body.lastUpdated)
        : new Date();
    }
  }
}
