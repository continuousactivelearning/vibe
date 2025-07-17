import { IQuizAttempt, IScoringResponse, IScoreBreakdown, IScoringWeights, IQuestionGrade } from '#gamification/interfaces/scoring.js';
import { ObjectId } from 'mongodb';
import {GLOBAL_TYPES} from '#root/types.js';
import { injectable, inject } from 'inversify';
import { GAMIFICATION_TYPES, QUIZZES_TYPES } from '#gamification/types.js';
import { ScoringWeightsRepository } from '#shared/database/providers/mongo/repositories/WeightsRepository.js';
import { BaseService } from '#root/shared/classes/BaseService.js';
import { MongoDatabase } from '#shared/database/providers/mongo/MongoDatabase.js';
import { SubmissionRepository } from '#quizzes/repositories/providers/mongodb/SubmissionRepository.js';
import { UserGameMetricsService } from './UserGameMetricsService.js';
import { UserGameMetric } from '#gamification/classes/index.js';
import { NotFoundError, InternalServerError } from 'routing-controllers';

@injectable()
export class ScoringService extends BaseService {
  private defaultWeights: IScoringWeights = {
    highWeight: 2,
    lowWeight: 1,
    hintPenalty: -0.5,
    streakBonus: 3,
    timeWeight: 0.2,
    attemptPenalty: -0.5,
  };

  constructor(
    @inject(GAMIFICATION_TYPES.WeightsRepo)
    private weightsRepo: ScoringWeightsRepository,
    @inject(QUIZZES_TYPES.SubmissionRepo)
    private submissionRepo: SubmissionRepository,
    @inject(GAMIFICATION_TYPES.UserGameMetricsService)
    private userGameMetricsService: UserGameMetricsService,
    @inject(GLOBAL_TYPES.Database)
    private mongoDatabase: MongoDatabase
  ) {
    super(mongoDatabase);
  }

  private async getWeights(): Promise<IScoringWeights> {
    return this.weightsRepo.get();
  }

  private async getBasePoints(quizId: string, userId: string, attemptId: string): Promise<number> {
    const submission = await this.submissionRepo.get(
      quizId, 
      userId, 
      attemptId
    );
    
    if (!submission?.gradingResult?.totalScore) {
      throw new NotFoundError('Submission not found or not graded yet');
    }
    return submission.gradingResult.totalScore;
  }

  public async calculateScore(attempt: IQuizAttempt): Promise<IScoringResponse> {
    return this._withTransaction(async session => {
      const weights = await this.getWeights();
      const basePoints = await this.getBasePoints(
        attempt.quizId.toString(),
        attempt.userId.toString(),
        attempt.attemptId.toString()
      );

      // Calculate bonus components
      const confidenceScore = this.calculateConfidenceScore(attempt.grades, weights);
      const totalHintPenalty = attempt.hintCount * weights.hintPenalty;
      const streakBonusTotal = attempt.streaks * weights.streakBonus;
      const timeBonus = (attempt.idealTime - attempt.timeTaken) * weights.timeWeight;
      const totalAttemptPenalty = (attempt.attemptCount - 1) * weights.attemptPenalty;

      // Calculate total bonus
      const bonus = confidenceScore + totalHintPenalty + streakBonusTotal + timeBonus + totalAttemptPenalty;

      // Get current user points
      let currentPoints = 0;
      try {
        const existingMetrics = await this.userGameMetricsService.readUserGameMetrics(attempt.userId.toString());
        const existingMetric = existingMetrics.find(metric => 
          metric.metricId.toString() === attempt.metricId.toString()
        );
        currentPoints = existingMetric ? existingMetric.value : 0;
      } catch (error) {
        if (error instanceof NotFoundError) {
          currentPoints = 0;
        } else {
          throw error;
        }
      }

      let finalPoints: number;
      let pointsAdded: number;

      // Apply scoring logic based on attempt count
      if (attempt.attemptCount === 1) {
        // First attempt: use base points + bonus
        finalPoints = currentPoints+Math.max(0, Math.floor(basePoints + bonus));
        pointsAdded = Math.max(0, Math.floor(basePoints + bonus));
      } else {
        // Subsequent attempts: add only bonus to current points
        const bonusToAdd = Math.max(0, Math.floor(bonus));
        finalPoints = currentPoints + bonusToAdd;
        pointsAdded = bonusToAdd;
      }

      const breakdown: IScoreBreakdown = {
        basePoints,
        confidenceScore,
        totalHintPenalty,
        streakBonusTotal,
        timeBonus,
        totalAttemptPenalty,
      };

      // Update user game metric with final score
      try {
        const existingMetrics = await this.userGameMetricsService.readUserGameMetrics(attempt.userId.toString());
        const existingMetric = existingMetrics.find(metric => 
          metric.metricId.toString() === attempt.metricId.toString()
        );

        if (existingMetric) {
          // Update existing metric with final score
          const updatedMetric = new UserGameMetric({
            userId: attempt.userId.toString(),
            metricId: attempt.metricId.toString(),
            value: finalPoints,
            lastUpdated: new Date()
          });
          await this.userGameMetricsService.updateUserGameMetric(updatedMetric);
        } else {
          // Create new metric with final score
          const newMetric = new UserGameMetric({
            userId: attempt.userId.toString(),
            metricId: attempt.metricId.toString(),
            value: finalPoints,
            lastUpdated: new Date()
          });
          await this.userGameMetricsService.createUserGameMetric(newMetric);
        }
      } catch (error) {
        if (error instanceof NotFoundError) {
          // Create new metric with final score
          const newMetric = new UserGameMetric({
            userId: attempt.userId.toString(),
            metricId: attempt.metricId.toString(),
            value: finalPoints,
            lastUpdated: new Date()
          });
          await this.userGameMetricsService.createUserGameMetric(newMetric);
        } else {
          throw error;
        }
      }

      return {
        totalScore: finalPoints,
        breakdown,
        pointsAdded: pointsAdded,
      };
    });
  }

  private calculateConfidenceScore(grades: IQuestionGrade[], weights: IScoringWeights): number {
    let countHighCorrect = 0;
    let countHighWrong = 0;
    let countLowCorrect = 0;
    let countLowWrong = 0;

    for (const grade of grades) {
      const isHigh = grade.confidenceScore >= 3;
      if (grade.result) {
        isHigh ? countHighCorrect++ : countLowCorrect++;
      } else {
        isHigh ? countHighWrong++ : countLowWrong++;
      }
    }

    return (
      (countHighCorrect * weights.highWeight) -
      (countHighWrong * weights.highWeight) +
      (countLowCorrect * weights.lowWeight) -
      (countLowWrong * weights.lowWeight)
    );
  }

  public async getCurrentWeights(): Promise<IScoringWeights> {
    return this.getWeights();
  }

  public async updateWeights(newWeights: Partial<IScoringWeights>): Promise<IScoringWeights> {
    return this._withTransaction(async session => {
      return this.weightsRepo.update(newWeights);
    });
  }

}