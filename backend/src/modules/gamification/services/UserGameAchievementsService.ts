import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {GLOBAL_TYPES} from '#root/types.js';
import {
  BaseService,
  MongoDatabase,
  IGamifyEngineRepository,
  IUserRepository,
} from '#root/shared/index.js';
import {UserGameAchievement} from '#gamification/classes/index.js';
import {plainToInstance} from 'class-transformer';
import {ObjectId} from 'mongodb';
import {NotFoundError} from 'routing-controllers';

/**
 * UserGameAchievementsService - handles business logic for user achievements
 * Manages user achievement collections and their unlocked status
 */
@injectable()
export class UserGameAchievementsService extends BaseService {
  constructor(
    @inject(GLOBAL_TYPES.GamifyEngineRepo)
    private readonly gamifyEngineRepo: IGamifyEngineRepository,
    @inject(GLOBAL_TYPES.Database)
    private readonly mongoDatabase: MongoDatabase,
  ) {
    super(mongoDatabase);
  }

  /**
   * Creates a new user game achievement collection
   * Validates that no existing achievement collection exists for the user
   * @param userGameAchievement - The user achievement collection to create
   * @returns Promise resolving to the created achievement collection
   */
  createUserGameAchievement(
    userGameAchievement: UserGameAchievement,
  ): Promise<UserGameAchievement | null> {
    return this._withTransaction(async session => {
      userGameAchievement = plainToInstance(
        UserGameAchievement,
        userGameAchievement,
      );

      // Check if user already has an achievement collection
      const existingAchievement =
        await this.gamifyEngineRepo.readUserGameAchievements(
          userGameAchievement.userId,
          session,
        );

      if (existingAchievement) {
        throw new Error(
          `User game achievement for user ${userGameAchievement.userId} already exists`,
        );
      }

      const createdAchievement =
        await this.gamifyEngineRepo.createUserGameAchievement(
          userGameAchievement,
          session,
        );

      if (!createdAchievement) {
        throw new Error('Failed to create user game achievement');
      }

      return plainToInstance(UserGameAchievement, createdAchievement);
    });
  }

  /**
   * Retrieves all achievements for a specific user
   * @param userId - The ID of the user whose achievements to retrieve
   * @returns Promise resolving to the user's achievement collection
   */
  readUserGameAchievements(
    userId: string,
  ): Promise<UserGameAchievement | null> {
    return this._withTransaction(async session => {
      const userObjectId = new ObjectId(userId);

      const userAchievements =
        await this.gamifyEngineRepo.readUserGameAchievements(
          userObjectId,
          session,
        );

      if (!userAchievements) {
        throw new NotFoundError(
          `User game achievements for user ${userId} not found`,
        );
      }

      return plainToInstance(UserGameAchievement, userAchievements);
    });
  }

  /**
   * Updates a user's achievement collection
   * Validates that all referenced achievements exist before updating
   * @param achievements - The achievement collection to update
   * @returns Promise resolving to boolean indicating success
   */
  updateUserGameAchievement(
    achievements: UserGameAchievement,
  ): Promise<boolean> {
    return this._withTransaction(async session => {
      achievements = plainToInstance(UserGameAchievement, achievements);

      const {_id, ...achievementsdto} = achievements;

      // Validate that all achievement IDs exist in the database
      if (achievementsdto.achievements.length > 0) {
        const achievementIds = achievementsdto.achievements.map(ach =>
          ach.achievementId.toString(),
        );

        const existingAchievements =
          await this.gamifyEngineRepo.readAllAchievements(session);
        const existingAchievementsIds = existingAchievements.map(ach =>
          ach._id.toString(),
        );

        // Check if all achievement IDs are valid
        const allAchievementExist = achievementIds.every(achievementId =>
          existingAchievementsIds.includes(achievementId),
        );

        if (!allAchievementExist) {
          throw new NotFoundError(
            `One or more achievements not found for user ${achievements.userId}`,
          );
        }
      }

      const updateResult =
        await this.gamifyEngineRepo.UpdateUserGameAchievements(
          achievementsdto,
          session,
        );

      if (updateResult.matchedCount === 0) {
        throw new NotFoundError(
          `User game achievement for user ${achievements.userId} not found`,
        );
      }

      return updateResult.acknowledged && updateResult.modifiedCount > 0;
    });
  }

  /**
   * Removes a specific achievement from a user's collection
   * @param userId - The ID of the user
   * @param achievementId - The ID of the achievement to remove
   * @returns Promise resolving to boolean indicating success
   */
  deleteUserGameAchievement(
    userId: string,
    achievementId: string,
  ): Promise<boolean> {
    return this._withTransaction(async session => {
      const userObjectId = new ObjectId(userId);
      const achievementObjectId = new ObjectId(achievementId);

      // TODO: Consider implementing cascade deletion for better data management

      const deleteResult =
        await this.gamifyEngineRepo.deleteUserGameAchievement(
          userObjectId,
          achievementObjectId,
          session,
        );

      if (deleteResult.matchedCount === 0) {
        throw new NotFoundError(
          `User game achievement for user ${userId} not found`,
        );
      }

      return deleteResult.acknowledged && deleteResult.modifiedCount > 0;
    });
  }
}
