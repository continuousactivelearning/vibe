import 'reflect-metadata';
import {MongoDatabase} from '../MongoDatabase.js';
import {
  Collection,
  ObjectId,
  UpdateResult,
  ClientSession,
  DeleteResult,
  Document,
} from 'mongodb';
import {injectable, inject} from 'inversify';
import {IGamifyEngineRepository} from '#shared/database/index.js';
import {GLOBAL_TYPES} from '#root/types.js';
import {
  GameMetric,
  MetricAchievement,
  UserGameAchievement,
  UserGameMetric,
} from '#gamification/classes/index.js';
import {
  IGameMetric,
  IMetricAchievement,
  IUserGameMetric,
  IUserGameAchievement,
  IMetricTrigger,
} from '#root/shared/interfaces/models.js';

/**
 * Implementation of the Gamify Engine Repository for MongoDB.
 * Handles operations related to game metrics and achievements.
 */

@injectable()
export class GamifyEngineRepository implements IGamifyEngineRepository {
  // MongoDB collections for each entity
  private metricCollection: Collection<GameMetric>;
  private achievementCollection: Collection<MetricAchievement>;
  private userMetricCollection: Collection<UserGameMetric>;
  private userAchievementCollection: Collection<UserGameAchievement>;

  constructor(@inject(GLOBAL_TYPES.Database) private db: MongoDatabase) {}

  private initialized = false;

  // Initialize collections if not already done
  private async init() {
    if (!this.initialized) {
      this.metricCollection = await this.db.getCollection<GameMetric>(
        'gameMetrics',
      );
      this.achievementCollection =
        await this.db.getCollection<MetricAchievement>('metricAchievements');
      this.userMetricCollection = await this.db.getCollection<UserGameMetric>(
        'userGameMetrics',
      );
      this.userAchievementCollection =
        await this.db.getCollection<UserGameAchievement>(
          'userGameAchievements',
        );

      this.userMetricCollection.createIndex(
        {
          userId: 1,
          metricId: 1,
        },
        {unique: true},
      );
      this.initialized = true;
    }
  }

  // Create a new game metric
  async createGameMetric(
    gameMetric: IGameMetric,
    session?: ClientSession,
  ): Promise<IGameMetric | null> {
    await this.init();

    const result = await this.metricCollection.insertOne(gameMetric, {session});

    if (result.acknowledged) {
      const createdMetric = await this.metricCollection.findOne(
        {
          _id: result.insertedId,
        },
        {session},
      );

      return createdMetric;
    }
  }

  // Get a game metric by its ID
  async readGameMetric(
    gameMetricId: ObjectId,
    session?: ClientSession,
  ): Promise<IGameMetric | null> {
    await this.init();
    const metric = await this.metricCollection.findOne(
      {_id: gameMetricId},
      {session},
    );

    if (metric) {
      return metric;
    }
  }

  // Get all game metrics
  async readAllGameMetrics(
    session?: ClientSession,
  ): Promise<IGameMetric[] | null> {
    await this.init();

    const metrics = this.metricCollection.find({}, {session}).toArray();

    if (metrics) {
      return metrics;
    }
  }

  // Update a game metric by its ID
  async updateGameMetric(
    gameMetricId: ObjectId,
    gameMetric: Partial<IGameMetric>,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    await this.init();

    const result = await this.metricCollection.updateOne(
      {_id: gameMetricId},
      {$set: gameMetric},
      {session},
    );

    if (result.acknowledged) {
      return result;
    } else {
      throw new Error('Failed to update game metric');
    }
  }

  // Delete a game metric by its ID
  async deleteGameMetric(
    gameMetricId: string,
    session?: ClientSession,
  ): Promise<DeleteResult | null> {
    await this.init();

    const result = await this.metricCollection.deleteOne(
      {_id: new ObjectId(gameMetricId)},
      {session},
    );

    if (result.acknowledged) {
      return result;
    } else {
      throw new Error('Failed to delete game metric');
    }
  }

  // Create a new achievement
  async createAchievement(
    achievement: IMetricAchievement,
    session?: ClientSession,
  ): Promise<IMetricAchievement | null> {
    await this.init();

    const result = await this.achievementCollection.insertOne(achievement, {
      session,
    });

    if (result.acknowledged) {
      const createdAchievement = await this.achievementCollection.findOne(
        {
          _id: result.insertedId,
        },
        {session},
      );

      return createdAchievement;
    }
  }

  // Get an achievement by its ID
  async readAchievement(
    achievementId: ObjectId,
    session?: ClientSession,
  ): Promise<IMetricAchievement | null> {
    await this.init();

    const achievement = await this.achievementCollection.findOne(
      {_id: achievementId},
      {session},
    );

    if (achievement) {
      return achievement;
    }
  }

  // Get all achievements
  async readAllAchievements(
    session?: ClientSession,
  ): Promise<IMetricAchievement[] | null> {
    await this.init();

    const achievements = await this.achievementCollection
      .find({}, {session})
      .toArray();

    if (achievements) {
      return achievements;
    }
  }

  // Update an achievement by its ID
  async updateAchievement(
    achievementId: ObjectId,
    achievement: Partial<IMetricAchievement>,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    await this.init();

    const result = await this.achievementCollection.updateOne(
      {_id: achievementId},
      {$set: achievement},
      {session},
    );

    if (result.acknowledged) {
      return result;
    }
    throw new Error('Failed to update achievement');
  }

  // Delete an achievement by its ID
  async deleteAchievement(
    achievementId: ObjectId,
    session?: ClientSession,
  ): Promise<DeleteResult | null> {
    await this.init();

    const result = await this.achievementCollection.deleteOne(
      {_id: achievementId},
      {session},
    );

    if (result.acknowledged) {
      return result;
    }
    throw new Error('Failed to delete achievement');
  }

  // Create a user game metric (user progress on a metric)
  async createUserGameMetric(
    userGameMetric: IUserGameMetric,
    session?: ClientSession,
  ): Promise<IUserGameMetric | null> {
    await this.init();

    const result = await this.userMetricCollection.insertOne(userGameMetric, {
      session,
    });

    if (result.acknowledged) {
      const createdUserMetric = await this.userMetricCollection.findOne(
        {_id: result.insertedId},
        {session},
      );

      return createdUserMetric;
    }
  }

  async createUserGameMetrics(
    userGameMetrics: IUserGameMetric[],
    session?: ClientSession,
  ): Promise<IUserGameMetric[] | null> {
    await this.init();

    const bulkOps = userGameMetrics.map(metric => ({
      updateOne: {
        filter: {
          userId: metric.userId,
          metricId: metric.metricId,
        },
        update: {
          $setOnInsert: metric,
        },
        upsert: true,
      },
    }));

    const result = await this.userMetricCollection.bulkWrite(bulkOps, {
      session,
    });

    const upsertedIds = Object.values(result.upsertedIds);

    if (upsertedIds.length > 0) {
      const createdMetrics = await this.userMetricCollection
        .find({_id: {$in: upsertedIds}}, {session})
        .toArray();

      return createdMetrics;
    }
  }

  // Get all game metrics for a user
  async readAllUserGameMetric(
    userId: ObjectId,
    session?: ClientSession,
  ): Promise<IUserGameMetric[] | null> {
    await this.init();

    const userMetrics = this.userMetricCollection
      .find({userId: userId}, {session})
      .toArray();

    if (userMetrics) {
      return userMetrics;
    }
  }

  // Get a specific user game metric
  async readUserGameMetric(
    userId: ObjectId,
    gameMetricId: ObjectId,
    session?: ClientSession,
  ): Promise<IUserGameMetric | null> {
    await this.init();
    // We need to use get-create pattern here to ensure that we do lazy loading of the user metric.
    const userMetric = await this.userMetricCollection.findOne(
      {userId: userId, metricId: gameMetricId},
      {session},
    );

    if (userMetric) {
      return userMetric;
    }
  }

  // Update a user's game metric
  async updateUserGameMetric(
    userId: ObjectId,
    gameMetricId: ObjectId,
    UserGameMetric: Partial<IUserGameMetric>,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    await this.init();
    const updateResult = await this.userMetricCollection.updateOne(
      {userId: userId, metricId: gameMetricId},
      {$set: UserGameMetric},
      {session},
    );

    if (updateResult.acknowledged) {
      return updateResult;
    }
  }

  // Delete a user's game metric
  async deleteUserGameMetric(
    userId: ObjectId,
    gameMetricId: ObjectId,
    session?: ClientSession,
  ): Promise<DeleteResult | null> {
    await this.init();

    const result = await this.userMetricCollection.deleteOne(
      {userId: userId, metricId: gameMetricId},
      {session},
    );

    if (result.acknowledged) {
      return result;
    }
  }

  // Delete a user's game metric by its ID
  async deleteUserGameMetricById(
    metricId: ObjectId,
    session?: ClientSession,
  ): Promise<DeleteResult | null> {
    await this.init();

    const result = await this.userMetricCollection.deleteMany(
      {
        metricId: metricId,
      },
      {session},
    );

    if (result.acknowledged) {
      return result;
    }
  }

  // Create a user achievement (when a user unlocks an achievement)
  async createUserGameAchievement(
    userGameAchievement: IUserGameAchievement,
    session?: ClientSession,
  ): Promise<IUserGameAchievement | null> {
    await this.init();

    const result = await this.userAchievementCollection.insertOne(
      userGameAchievement,
      {session},
    );

    if (result.acknowledged) {
      const createdUserAchievement =
        await this.userAchievementCollection.findOne(
          {_id: result.insertedId},
          {session},
        );

      return createdUserAchievement;
    }

    throw new Error('Failed to create user game achievement');
  }

  // Get all achievements for a user
  async readUserGameAchievements(
    userId: ObjectId,
    session?: ClientSession,
  ): Promise<IUserGameAchievement | null> {
    await this.init();

    const userAchievements = await this.userAchievementCollection.findOne(
      {
        userId: userId,
      },
      {session},
    );

    if (userAchievements) {
      return userAchievements;
    }
  }

  // Update a user's achievements
  async UpdateUserGameAchievements(
    achievements: IUserGameAchievement,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    await this.init();

    const result = await this.userAchievementCollection.updateOne(
      {userId: achievements.userId},
      {$set: achievements},
      {session},
    );

    if (result.acknowledged) {
      return result;
    }

    throw new Error(
      `Failed to add achievements for user with ID ${achievements.userId}`,
    );
  }

  // Delete a user's achievement
  async deleteUserGameAchievement(
    userId: ObjectId,
    achievementId: ObjectId,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    await this.init();

    const result = await this.userAchievementCollection.updateOne(
      {userId: userId},
      {
        $pull: {
          achievements: {
            achievementId: achievementId,
          },
        },
      },
      {session},
    );

    if (result.acknowledged) {
      return result;
    }

    throw new Error(
      `Failed to delete achievement with ID ${achievementId} for user with ID ${userId}`,
    );
  }

  // Core gamification logic: update metrics and unlock achievements
  async metricTrigger(
    metricTriggers: IMetricTrigger,
    session?: ClientSession,
  ): Promise<{
    metricsUpdated: IUserGameMetric[];
    achievementsUnlocked: Document[];
  } | null> {
    await this.init();

    // Step 1: Update the User game metrics.

    const metricIds = metricTriggers.metrics.map(metric => metric.metricId);

    // Fetch the metrics by metricIds.

    const metrics = await this.metricCollection
      .find(
        {_id: {$in: metricIds}},
        {
          projection: {
            _id: 1,
            defaultIncrementValue: 1,
          },
          session,
        },
      )
      .toArray();

    if (metrics.length !== metricTriggers.metrics.length) {
      return;
    }

    const docsById = new Map(metrics.map(doc => [doc._id.toString(), doc]));
    const orderedDocs = metricIds.map(id => docsById.get(id.toString()));

    //Update the metric values to defaultValue if the metric value is not provided.

    metricTriggers.metrics = metricTriggers.metrics.map((metric, index) => {
      const metricDoc = orderedDocs[index];
      return {
        ...metric,
        value:
          metric.value === undefined
            ? metricDoc.defaultIncrementValue
            : metric.value,
      };
    });

    const bulkOps = metricTriggers.metrics.map(metric => {
      return {
        updateOne: {
          filter: {
            userId: metricTriggers.userId,
            metricId: metric.metricId,
          },
          update: {$inc: {value: metric.value}},
          upsert: true, // Create if it doesn't exist
        },
      };
    });

    // Step 2: Execute the bulk update operation.
    const updateResult = await this.userMetricCollection.bulkWrite(bulkOps, {
      session,
    });

    // Step 3: fetch the updated user metrics.
    const metricsUpdated = await this.userMetricCollection
      .find(
        {
          userId: metricTriggers.userId,
          metricId: {$in: metricIds},
        },
        {
          projection: {
            _id: 0,
            metricId: 1,
            value: 1,
          },
          session,
        },
      )
      .toArray();

    // Step 4: fetch eligible achievements for the user.
    if (metricsUpdated.length === 0) {
      return null;
    }

    const aggregateCondition = metricsUpdated.map(metric => ({
      $and: [
        {metricId: metric.metricId},
        {$expr: {$lte: ['$metricCount', metric.value]}},
      ],
    }));

    const condition = [{$match: {$or: aggregateCondition}}];

    const achievementsUnlocked = await this.achievementCollection
      .aggregate(condition, {session})
      .toArray();

    // Step 5: Update the user achievements with the unlocked achievements.
    const achievementIds = achievementsUnlocked.map(ach => ({
      achievementId: ach._id,
      unlockedAt: new Date(),
    }));

    const updateResultAchievements =
      await this.userAchievementCollection.updateOne(
        {userId: metricTriggers.userId},
        {
          $addToSet: {
            achievements: {
              $each: achievementIds,
            },
          },
        },
      );

    const achievementsUpdated = achievementsUnlocked.map(ach => ({
      achievementId: ach._id,
      name: ach.name,
      description: ach.description,
      badgeUrl: ach.badgeUrl,
      unlockedAt: ach.unlockedAt,
    }));

    return {
      metricsUpdated: metricsUpdated,
      achievementsUnlocked: achievementsUpdated,
    };
  }
}
