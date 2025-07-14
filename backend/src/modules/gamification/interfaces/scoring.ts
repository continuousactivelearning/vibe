  import { ObjectId } from 'mongodb';

  export type ConfidenceScore = 1 | 2 | 3 | 4 | 5;

  export interface IQuestionGrade {
    questionId: string | ObjectId;
    confidenceScore: ConfidenceScore;
    result: boolean;
  }

  export interface IQuizAttempt {
    userId: string | ObjectId;
    quizId: string | ObjectId;
    attemptId: string | ObjectId;
    metricId: string | ObjectId;
    grades: IQuestionGrade[];
    streaks: number;
    timeTaken: number;
    idealTime: number;
    attemptCount: number;
    hintCount: number;
  }

  export interface IScoreBreakdown {
    basePoints: number;
    confidenceScore: number;
    totalHintPenalty: number;
    streakBonusTotal: number;
    timeBonus: number;
    totalAttemptPenalty: number;
  }

  export interface IScoringResponse {
    totalScore: number;
    breakdown: IScoreBreakdown;
    pointsAdded: number;
  }

  export interface IScoringWeights {
    readonly _id?: ObjectId;
    highWeight: number;
    lowWeight: number;
    hintPenalty: number;
    streakBonus: number;
    timeWeight: number;
    attemptPenalty: number;
    createdAt?: Date;
    updatedAt?: Date;
  }