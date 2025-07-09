import {injectable, inject} from 'inversify';
import {
  JsonController,
  Authorized,
  Post,
  Get,
  Put,
  HttpCode,
  Body,
  Params,
  Delete,
} from 'routing-controllers';

import {
  metricService,
  achievementService,
  userGameAchievementsService,
  userGameMetricsService,
  metricTriggerService,
} from '#gamification/services/index.js';
import {
  GameMetric,
  MetricAchievement,
  CreateGameMetricBody,
  GameMetricsParams,
  updateGameMetric,
  CreateMetricAchievementBody,
  AchievementParams,
  UpdateMetricAchievementBody,
  CreateUserGameAchievementBody,
  UserGameAchievement,
  GetUserGameAchievementParams,
  UpdateUserGameAchievementBody,
  DeleteUserGameAchievementParams,
  UserGameMetricBody,
  UserGameMetric,
  ReadUserGameMetricsParams,
  UpdateUserGameMetricBody,
  DeleteUserGameMetricParams,
  MetricTriggerValidator,
  MetricTrigger,
  MetricTriggerResponse,
} from '#gamification/classes/index.js';

import {GAMIFICATION_TYPES} from '../types.js';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {OpenAPI} from 'routing-controllers-openapi';

@OpenAPI({
  tags: ['GamifyEngine'],
})
@injectable()
@JsonController('/gamification/engine', {
  transformResponse: true,
})
export class GamifyEngineController {
  constructor(
    @inject(GAMIFICATION_TYPES.MetricService)
    private readonly MetricService: metricService,

    @inject(GAMIFICATION_TYPES.AchievementService)
    private readonly AchievementService: achievementService,

    @inject(GAMIFICATION_TYPES.UserGameAchievementsService)
    private readonly UserGameAchievementsService: userGameAchievementsService,

    @inject(GAMIFICATION_TYPES.UserGameMetricsService)
    private readonly UserGameMetricsService: userGameMetricsService,

    @inject(GAMIFICATION_TYPES.MetricTriggerService)
    private readonly MetricTriggerService: metricTriggerService,
  ) {}

  @Authorized(['admin', 'instructor'])
  @Post('/metrics')
  @HttpCode(201)
  async createGameMetric(
    @Body() body: CreateGameMetricBody,
  ): Promise<GameMetric> {
    // This method creates a game metric.
    // It expects the body to contain the game metric data.
    const gameMetric = new GameMetric(body);
    const createdMetric = await this.MetricService.createGameMetric(gameMetric);

    return instanceToPlain(createdMetric) as GameMetric;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/metrics/:metricId')
  @HttpCode(200)
  async getGameMetricById(
    @Params() params: GameMetricsParams,
  ): Promise<GameMetric> {
    // This method retrieves a game metric by its ID.
    // It expects the ID to be passed as a parameter.
    const metric = await this.MetricService.getGameMetricById(params.metricId);

    return metric;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/metrics/')
  async getGameMetrics(): Promise<GameMetric[]> {
    const metrics = await this.MetricService.getGameMetrics();
    return instanceToPlain(metrics) as GameMetric[];
  }

  @Authorized(['admin', 'instructor'])
  @Put('/metrics/')
  @HttpCode(200)
  async updateGameMetric(
    @Body() body: updateGameMetric,
  ): Promise<{status: boolean}> {
    const {metricId, ...updateData} = body;

    const updateResult = await this.MetricService.updateGameMetric(
      metricId,
      updateData,
    );

    return {status: updateResult};
  }

  @Authorized(['admin', 'instructor'])
  @Delete('/metrics/:metricId')
  @HttpCode(200)
  async deleteGameMetric(
    @Params() params: GameMetricsParams,
  ): Promise<{status: boolean}> {
    // This method deletes a game metric by its ID.
    // It expects the ID to be passed as a parameter.
    const metricId = params.metricId;

    const deleteResult = await this.MetricService.deleteGameMetric(metricId);

    return {status: deleteResult};
  }

  @Authorized(['admin', 'instructor'])
  @Post('/achievements')
  @HttpCode(201)
  async createAchievement(
    @Body() body: CreateMetricAchievementBody,
  ): Promise<MetricAchievement> {
    // This method creates a metric achievement.
    // It expects the body to contain the achievement data.
    let achievement = new MetricAchievement(body);

    achievement = plainToInstance(MetricAchievement, achievement);

    const createdAchievement = await this.AchievementService.createAchievement(
      achievement,
    );

    return createdAchievement;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/achievements/:achievementId')
  @HttpCode(200)
  async getAchievementById(
    @Params() params: AchievementParams,
  ): Promise<MetricAchievement> {
    // This method retrieves a achievement by its ID.
    // It expects the ID to be passed as a parameter.
    const achievement = await this.AchievementService.getAchievementById(
      params.achievementId,
    );

    return achievement;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/achievements/')
  @HttpCode(200)
  async getAchievements(): Promise<MetricAchievement[]> {
    // This method retrieves all achievements.
    const achievements = await this.AchievementService.getAchievements();
    return achievements;
  }

  @Authorized(['admin', 'instructor'])
  @Put('/achievements/')
  @HttpCode(200)
  async updateAchievement(
    @Body() body: UpdateMetricAchievementBody,
  ): Promise<{status: boolean}> {
    // This method updates an achievement.
    // It expects the body to contain the achievement data.
    const {achievementId, ...updateData} = body;

    const achievementData = new MetricAchievement(updateData);

    const updateResult = await this.AchievementService.updateAchievement(
      achievementId,
      achievementData,
    );

    return {status: updateResult};
  }

  @Authorized(['admin', 'instructor'])
  @Delete('/achievements/:achievementId')
  @HttpCode(200)
  async deleteAchievement(
    @Params() params: AchievementParams,
  ): Promise<{status: boolean}> {
    // This method deletes an achievement by its ID.
    // It expects the ID to be passed as a parameter.
    const achievementId = params.achievementId;

    const deleteResult = await this.AchievementService.deleteAchievement(
      achievementId,
    );

    return {status: deleteResult};
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Post('/userachievements')
  @HttpCode(201)
  async createUserGameAchievement(
    @Body() body: CreateUserGameAchievementBody,
  ): Promise<UserGameAchievement> {
    // This method creates a user game achievement.
    // It expects the body to contain the user game achievement data.

    const userGameAchievement = new UserGameAchievement(body);

    const createdAchievement =
      await this.UserGameAchievementsService.createUserGameAchievement(
        userGameAchievement,
      );

    return createdAchievement;
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Get('/userachievements/:userId')
  @HttpCode(200)
  async getUserGameAchievements(
    @Params() params: GetUserGameAchievementParams,
  ): Promise<UserGameAchievement> {
    // This method retrives user game achievements by user ID.

    // It expects the user ID to be passed as a parameter.

    const userId = params.userId;

    const userAchievements =
      await this.UserGameAchievementsService.readUserGameAchievements(userId);

    return userAchievements;
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Put('/userachievements')
  @HttpCode(200)
  async UpdateUserGameAchievements(
    @Body() body: UpdateUserGameAchievementBody,
  ): Promise<{status: boolean}> {
    // This method updates user game achievements.
    // It expects the body to contain the user game achievement data.

    const userGameAchievement = new UserGameAchievement(body);

    const updateResult =
      await this.UserGameAchievementsService.updateUserGameAchievement(
        userGameAchievement,
      );

    return {status: updateResult};
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Delete('/userachievements/:userId/:achievementId')
  @HttpCode(200)
  async deleteUserGameAchievement(
    @Params() params: DeleteUserGameAchievementParams,
  ): Promise<{status: boolean}> {
    // This method deletes a user game achievement by user ID and achievement ID.
    // It expects the user ID and achievement ID to be passed as parameters.

    const {userId, achievementId} = params;

    const deleteResult =
      await this.UserGameAchievementsService.deleteUserGameAchievement(
        userId,
        achievementId,
      );

    return {status: deleteResult};
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Post('/usermetrics/')
  @HttpCode(201)
  async createUserGameMetric(@Body() body: UserGameMetricBody) {
    // This method creates a user game metric.
    // It expects the body to cotain the user game metric data.

    const userGameMetric = new UserGameMetric(body);

    const createdMetric =
      await this.UserGameMetricsService.createUserGameMetric(userGameMetric);

    return createdMetric;
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Get('/usermetrics/:userId')
  @HttpCode(200)
  async getUserGameMetrics(
    @Params() params: ReadUserGameMetricsParams,
  ): Promise<UserGameMetric[]> {
    const metrics = await this.UserGameMetricsService.readUserGameMetrics(
      params.userId,
    );
    return metrics;
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Put('/usermetrics/')
  @HttpCode(200)
  async updateUserGameMetric(
    @Body() body: UpdateUserGameMetricBody,
  ): Promise<{status: boolean}> {
    const userGameMetric = new UserGameMetric(body);
    const updateResult = await this.UserGameMetricsService.updateUserGameMetric(
      userGameMetric,
    );
    return {status: updateResult};
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Delete('/usermetrics/:userId/:metricId')
  @HttpCode(200)
  async deleteUserGameMetric(
    @Params() params: DeleteUserGameMetricParams,
  ): Promise<{status: boolean}> {
    const deleteResult = await this.UserGameMetricsService.deleteUserGameMetric(
      params.userId,
      params.metricId,
    );
    return {status: deleteResult};
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Post('/metrictrigger')
  @HttpCode(200)
  async MetricTriggers(
    @Body() body: MetricTriggerValidator,
  ): Promise<MetricTriggerResponse> {
    const metricTrigger = new MetricTrigger(body);
    const metricTriggerResult = await this.MetricTriggerService.metricTrigger(
      metricTrigger,
    );

    return metricTriggerResult;
  }
}
