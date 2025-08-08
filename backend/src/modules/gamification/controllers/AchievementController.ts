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
  achievementService,
  userGameAchievementsService,
} from '#gamification/services/index.js';

import {
  MetricAchievement,
  CreateMetricAchievementBody,
  AchievementParams,
  UpdateMetricAchievementBody,
  CreateUserGameAchievementBody,
  UserGameAchievement,
  GetUserGameAchievementParams,
  UpdateUserGameAchievementBody,
  DeleteUserGameAchievementParams,
} from '#gamification/classes/index.js';

import {GAMIFICATION_TYPES} from '../types.js';
import {plainToInstance} from 'class-transformer';
import {OpenAPI} from 'routing-controllers-openapi';

@OpenAPI({
  tags: ['Achievements'],
})
@injectable()
@JsonController('/gamification/engine', {
  transformResponse: true,
})
export class AchievementController {
  constructor(
    @inject(GAMIFICATION_TYPES.AchievementService)
    private readonly AchievementService: achievementService,

    @inject(GAMIFICATION_TYPES.UserGameAchievementsService)
    private readonly UserGameAchievementsService: userGameAchievementsService,
  ) {}

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
    const {achievementId} = body;

    const achievementData = new MetricAchievement(body);

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
  @Post('/user/achievements')
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
  @Get('/user/:userId/achievements/')
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
  @Put('/user/achievements')
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
  @Delete('/user/:userId/achievements/:achievementId')
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
}
