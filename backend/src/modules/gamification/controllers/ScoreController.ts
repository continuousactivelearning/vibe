import {
  JsonController,
  Post,
  Body,
  HttpCode,
  Get,
  Put,
  Authorized,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { inject, injectable } from 'inversify';
import { ScoringService } from '#gamification/services/ScoringService.js';
import { IScoringResponse, IScoringWeights } from '#gamification/interfaces/scoring.js';
import { GAMIFICATION_TYPES } from '#gamification/types.js';
import { QuizAttemptValidator,ScoringWeightsValidator } from '#gamification/classes/validators/ScoringValidators.js';
import { validateOrReject } from 'class-validator';
import { QuizAttempt, ScoringWeights,ScoringResponse } from '#gamification/classes/transformers/ScoringTransformer.js';

@OpenAPI({ tags: ['Gamification'] })
@injectable()
@JsonController('/gamification')
export class ScoreController {
  constructor(
    @inject(GAMIFICATION_TYPES.ScoringService)
    private scoringService: ScoringService
  ) {}

  @Post('/score')
  @HttpCode(200)
  @Authorized(['admin', 'instructor', 'user'])
  @OpenAPI({
    summary: 'Calculate gamification score',
    description: 'Calculates score based on quiz attempt data',
  })
  @ResponseSchema(ScoringResponse, {
    description: 'Score calculation successful',
  })
  async calculateScore(@Body() body: QuizAttemptValidator): Promise<IScoringResponse> {
    const attempt = new QuizAttempt(body);
    return this.scoringService.calculateScore(attempt);
  }

  @Get('/weights')
  @HttpCode(200)
  @Authorized(['admin', 'instructor', 'user'])
  @OpenAPI({
    summary: 'Get current scoring weights',
    description: 'Returns the current scoring weights configuration',
  })
  @ResponseSchema(ScoringWeights, {
    description: 'Weights retrieved successfully',
  })
  async getWeights(): Promise<IScoringWeights> {
    return this.scoringService.getCurrentWeights();
  }

  @Put('/weights')
  @HttpCode(200)
  @Authorized(['admin', 'instructor'])
  @OpenAPI({
    summary: 'Update scoring weights',
    description: 'Updates the scoring weights configuration',
  })
  @ResponseSchema(ScoringWeights, {
    description: 'Weights updated successfully',
  })
  async updateWeights(@Body() body: ScoringWeightsValidator): Promise<IScoringWeights> {
    const weights = new ScoringWeights(body);
    return this.scoringService.updateWeights(weights);
  }
}