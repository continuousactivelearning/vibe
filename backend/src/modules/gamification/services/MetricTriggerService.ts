import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {GLOBAL_TYPES} from '#root/types.js';
import {
  BaseService,
  MongoDatabase,
  IGamifyEngineRepository,
} from '#root/shared/index.js';
import {MetricTrigger, MetricTriggerResponse} from '../classes/index.js';
import {plainToInstance} from 'class-transformer';
import {IMetricTrigger, IUserGameMetric} from '#root/shared/index.js';
import {Document} from 'mongodb';
import {BadRequestError, NotFoundError} from 'routing-controllers';

/**
 * MetricTriggerService - handles the core gamification engine logic
 * Processes metric updates and determines which achievements to unlock
 */
@injectable()
export class MetricTriggerService extends BaseService {
  constructor(
    @inject(GLOBAL_TYPES.GamifyEngineRepo)
    private readonly gamifyEngineRepo: IGamifyEngineRepository,

    @inject(GLOBAL_TYPES.Database)
    private readonly mongoDatabase: MongoDatabase,
  ) {
    super(mongoDatabase);
  }

  /**
   * Triggers the gamification engine to process metric updates
   * Updates user metrics and unlocks any qualifying achievements
   * @param body - The metric trigger request containing user ID and metrics to update
   * @returns Promise resolving to response with updated metrics and unlocked achievements
   */
  async metricTrigger(body: MetricTrigger): Promise<MetricTriggerResponse> {
    return this._withTransaction(async session => {
      const metricIds = body.metrics.map(metric => metric.metricId);

      // Validate the metric Ids are not duplicated.

      const uniqueMetricIds = new Set(metricIds);

      if (uniqueMetricIds.size !== metricIds.length) {
        throw new NotFoundError(
          `Duplicate metric IDs found in request: ${JSON.stringify(
            metricIds,
          )} expected unique IDs.`,
        );
      }

      // Transform the MetricTrigger instance for proper validation
      body = plainToInstance(MetricTrigger, body);

      // Execute the core gamification logic
      const result = await this.gamifyEngineRepo.metricTrigger(body, session);

      if (!result) {
        throw new BadRequestError(
          `No metrics updated for user ${
            body.userId
          } with metrics: ${JSON.stringify(body.metrics)}`,
        );
      }

      return plainToInstance(MetricTriggerResponse, result);
    });
  }
}
