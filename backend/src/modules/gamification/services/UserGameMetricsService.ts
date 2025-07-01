import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {GLOBAL_TYPES} from '#root/types.js';
import {
  BaseService,
  MongoDatabase,
  IGamifyEngineRepository,
} from '#root/shared/index.js';
import {UserGameMetric} from '../classes/index.js';
import {plainToInstance} from 'class-transformer';
import {ObjectId} from 'mongodb';
import {NotFoundError} from 'routing-controllers';

/**
 * UserGameMetricsService - handles business logic for user game metrics
 * Manages user progress tracking on individual metrics
 */
@injectable()
export class UserGameMetricsService extends BaseService {
  constructor(
    @inject(GLOBAL_TYPES.GamifyEngineRepo)
    private readonly gamifyEngineRepo: IGamifyEngineRepository,

    @inject(GLOBAL_TYPES.Database)
    private readonly mongoDatabase: MongoDatabase,
  ) {
    super(mongoDatabase);
  }

  /**
   * Creates a new user game metric
   * Validates that the metric exists and no duplicate exists for the user
   * @param userGameMetric - The user game metric to create
   * @returns Promise resolving to the created user metric
   */
  createUserGameMetric(
    userGameMetric: UserGameMetric,
  ): Promise<UserGameMetric | null> {
    return this._withTransaction(async session => {
      // Transform the UserGameMetric instance
      userGameMetric = plainToInstance(UserGameMetric, userGameMetric);

      // Check if the metricId is valid
      const validMetric = await this.gamifyEngineRepo.readGameMetric(
        userGameMetric.metricId,
        session,
      );

      if (!validMetric) {
        throw new NotFoundError(
          `Game metric with ID ${userGameMetric.metricId} not found`,
        );
      }

      // Check if the userGameMetric already exists
      const existingMetric = await this.gamifyEngineRepo.readUserGameMetric(
        userGameMetric.userId,
        userGameMetric.metricId,
        session,
      );

      if (existingMetric) {
        throw new Error(
          `User game metric for user ${userGameMetric.userId} and metric ${userGameMetric.metricId} already exists`,
        );
      }

      const createdMetric = await this.gamifyEngineRepo.createUserGameMetric(
        userGameMetric,
        session,
      );

      if (!createdMetric) {
        throw new Error('Failed to create user game metric');
      }

      return plainToInstance(UserGameMetric, createdMetric);
    });
  }

  /**
   * Retrieves all game metrics for a specific user
   * @param userId - The ID of the user whose metrics to retrieve
   * @returns Promise resolving to array of user game metrics
   */
  readUserGameMetrics(userId: string): Promise<UserGameMetric[]> {
    return this._withTransaction(async session => {
      const userObjectId = new ObjectId(userId);

      const metrics = await this.gamifyEngineRepo.readAllUserGameMetric(
        userObjectId,
        session,
      );
      if (!metrics || metrics.length === 0) {
        throw new NotFoundError(`No metrics found for user ${userId}`);
      }

      return plainToInstance(UserGameMetric, metrics);
    });
  }

  /**
   * Updates a user's game metric progress
   * Validates that the metric exists before updating
   * @param userGameMetric - Partial user game metric data to update
   * @returns Promise resolving to boolean indicating success
   */
  updateUserGameMetric(
    userGameMetric: Partial<UserGameMetric>,
  ): Promise<boolean> {
    return this._withTransaction(async session => {
      const metricToUpdate = plainToInstance(UserGameMetric, userGameMetric);

      // Check if the user game metric exists
      const existingMetric = await this.gamifyEngineRepo.readUserGameMetric(
        metricToUpdate.userId,
        metricToUpdate.metricId,
        session,
      );

      if (!existingMetric) {
        throw new NotFoundError(
          `User game metric not found for user ${metricToUpdate.userId} and metric ${metricToUpdate.metricId}`,
        );
      }

      const {_id, ...userGameMetricdto} = metricToUpdate;

      const updateData = {
        ...userGameMetricdto,
        lastUpdated: new Date(),
      };

      const updateResult = await this.gamifyEngineRepo.updateUserGameMetric(
        metricToUpdate.userId,
        metricToUpdate.metricId,
        updateData,
        session,
      );

      return updateResult?.modifiedCount === 1;
    });
  }

  /**
   * Deletes a user's game metric
   * @param userId - The ID of the user
   * @param metricId - The ID of the metric
   * @returns Promise resolving to boolean indicating success
   */
  deleteUserGameMetric(userId: string, metricId: string): Promise<boolean> {
    return this._withTransaction(async session => {
      const metricToDelete = plainToInstance(UserGameMetric, {
        userId,
        metricId,
      });

      const deleteResult = await this.gamifyEngineRepo.deleteUserGameMetric(
        metricToDelete.userId,
        metricToDelete.metricId,
        session,
      );

      if (deleteResult.deletedCount === 0) {
        throw new NotFoundError(
          `Unable to delete for user ${metricToDelete.userId} and metric ${metricToDelete.metricId} check if it exists`,
        );
      }

      return deleteResult?.deletedCount === 1;
    });
  }
}
