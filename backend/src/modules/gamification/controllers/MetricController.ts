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
  userGameMetricsService,
} from '#gamification/services/index.js';

import {
  GameMetric,
  CreateGameMetricBody,
  GameMetricsParams,
  updateGameMetric,
  UserGameMetricBody,
  UserGameMetric,
  ReadUserGameMetricsParams,
  UpdateUserGameMetricBody,
  DeleteUserGameMetricParams,
} from '#gamification/classes/index.js';

import {GAMIFICATION_TYPES} from '../types.js';
import {instanceToPlain} from 'class-transformer';
import {OpenAPI} from 'routing-controllers-openapi';

@OpenAPI({
  tags: ['Metrics'],
})
@injectable()
@JsonController('/gamification/engine', {
  transformResponse: true,
})
export class MetricController {
  constructor(
    @inject(GAMIFICATION_TYPES.MetricService)
    private readonly MetricService: metricService,

    @inject(GAMIFICATION_TYPES.UserGameMetricsService)
    private readonly UserGameMetricsService: userGameMetricsService,
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

  @Authorized(['admin', 'instructor', 'student'])
  @Post('/user/metrics/')
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
  @Get('/user/:userId/metrics/')
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
  @Put('/user/metrics/')
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
  @Delete('/user/:userId/metrics/:metricId')
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
}
