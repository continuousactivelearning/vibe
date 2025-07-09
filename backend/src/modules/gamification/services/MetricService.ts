import {injectable, inject} from 'inversify';
import {ObjectId} from 'mongodb';
import {NotFoundError, InternalServerError} from 'routing-controllers';
import {
  BaseService,
  MongoDatabase,
  IGamifyEngineRepository,
} from '#root/shared/index.js';
import {GLOBAL_TYPES} from '#root/types.js';
import {GameMetric} from '#gamification/classes/index.js';
import {plainToInstance} from 'class-transformer';

/**
 * MetricService - handles business logic for game metrics
 * Manages CRUD operations for trackable metrics in the gamification system
 */
@injectable()
export class metricService extends BaseService {
  constructor(
    @inject(GLOBAL_TYPES.GamifyEngineRepo)
    private readonly gamifyEngineRepo: IGamifyEngineRepository,

    @inject(GLOBAL_TYPES.Database)
    private readonly mongoDatabase: MongoDatabase,
  ) {
    super(mongoDatabase);
  }

  /**
   * Creates a new game metric
   * @param gameMetric - The game metric to create
   * @returns Promise resolving to the created metric
   */
  createGameMetric(gameMetric: GameMetric): Promise<GameMetric | null> {
    return this._withTransaction(async session => {
      const createdMetric = await this.gamifyEngineRepo.createGameMetric(
        gameMetric,
        session,
      );
      if (!createdMetric) {
        throw new InternalServerError('Failed to create game metric');
      }
      return plainToInstance(GameMetric, createdMetric);
    });
  }

  /**
   * Retrieves a game metric by its ID
   * @param id - The ID of the metric to retrieve
   * @returns Promise resolving to the metric or throws NotFoundError
   */
  getGameMetricById(id: string): Promise<GameMetric | null> {
    return this._withTransaction(async session => {
      const metricId = new ObjectId(id);
      const metric = await this.gamifyEngineRepo.readGameMetric(
        metricId,
        session,
      );

      if (!metric) {
        throw new NotFoundError(`Game metric with ID ${id} not found`);
      }
      return plainToInstance(GameMetric, metric);
    });
  }

  /**
   * Retrieves all game metrics
   * @returns Promise resolving to array of all metrics
   */
  getGameMetrics(): Promise<GameMetric[] | null> {
    return this._withTransaction(async session => {
      const metrics = await this.gamifyEngineRepo.readAllGameMetrics(session);

      return plainToInstance(GameMetric, metrics);
    });
  }

  /**
   * Updates an existing game metric
   * @param id - The ID of the metric to update
   * @param gameMetric - Partial metric data to update
   * @returns Promise resolving to boolean indicating success
   */
  updateGameMetric(
    id: string,
    gameMetric: Partial<GameMetric>,
  ): Promise<boolean> {
    return this._withTransaction(async session => {
      // Check if the game metric exists
      const metricId = new ObjectId(id);

      const updatedResult = await this.gamifyEngineRepo.updateGameMetric(
        metricId,
        gameMetric,
        session,
      );

      if (updatedResult.matchedCount === 0) {
        throw new NotFoundError(`Game metric with ID ${id} not found`);
      }

      return updatedResult.acknowledged && updatedResult.modifiedCount > 0;
    });
  }

  /**
   * Deletes a game metric by its ID
   * @param id - The ID of the metric to delete
   * @returns Promise resolving to boolean indicating success
   */
  deleteGameMetric(id: string): Promise<boolean> {
    return this._withTransaction(async session => {
      const metricId = new ObjectId(id);

      const deleteResult = await this.gamifyEngineRepo.deleteGameMetric(
        metricId,
        session,
      );

      if (deleteResult.deletedCount === 0) {
        throw new NotFoundError(`Game metric with ID ${id} not found`);
      }

      // Cascade delete user game metrics.
      const cascadeDeleteResult =
        await this.gamifyEngineRepo.deleteUserGameMetricById(metricId, session);

      if (!cascadeDeleteResult) {
        throw new InternalServerError(
          `Failed to cascade delete user game metrics for metric ID ${id}`,
        );
      }

      return deleteResult.acknowledged && deleteResult.deletedCount > 0;
    });
  }
}
