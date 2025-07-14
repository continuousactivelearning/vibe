import { ConfidenceScore, IQuizAttempt, IQuestionGrade, IScoringWeights, IScoreBreakdown, IScoringResponse } from '#gamification/interfaces/scoring.js';
import { Expose, Type, Transform } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';
import { ObjectId } from 'mongodb';
import { ObjectIdToString, StringToObjectId } from '#root/shared/constants/transformerConstants.js';
import { QuizAttemptValidator } from '#gamification/classes/validators/ScoringValidators.js';

export class QuizAttempt implements IQuizAttempt {
  @Expose()
  @JSONSchema({
    description: 'User ID',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @Transform(ObjectIdToString.transformer, { toPlainOnly: true })
  @Transform(StringToObjectId.transformer, { toClassOnly: true })
  userId: string | ObjectId;

  @Expose()
  @JSONSchema({
    description: 'Quiz ID',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
  })
  @Transform(ObjectIdToString.transformer, { toPlainOnly: true })
  @Transform(StringToObjectId.transformer, { toClassOnly: true })
  quizId: string | ObjectId;

  @Expose()
  @JSONSchema({
    description: 'Attempt ID',
    example: '60d5ec49b3f1c8e4a8f8b8c3',
  })
  @Transform(ObjectIdToString.transformer, { toPlainOnly: true })
  @Transform(StringToObjectId.transformer, { toClassOnly: true })
  attemptId: string | ObjectId;

  @Expose()
  @JSONSchema({
    description: 'Metric ID',
    example: '60d5ec49b3f1c8e4a8f8b8c4',
  })
  @Transform(ObjectIdToString.transformer, { toPlainOnly: true })
  @Transform(StringToObjectId.transformer, { toClassOnly: true })
  metricId: string | ObjectId;

  @Expose()
  @Type(() => QuestionGrade)
  grades: IQuestionGrade[];

  @Expose()
  streaks: number;

  @Expose()
  timeTaken: number;

  @Expose()
  idealTime: number;

  @Expose()
  attemptCount: number;

  @Expose()
  hintCount: number;

  constructor(data?: QuizAttemptValidator) {
    if (data) {
      this.userId = data.userId;
      this.quizId = data.quizId;
      this.attemptId = data.attemptId;
      this.metricId = data.metricId;
      this.grades = data.grades?.map(g => new QuestionGrade(g)) || [];
      this.streaks = data.streaks || 0;
      this.timeTaken = data.timeTaken || 0;
      this.idealTime = data.idealTime || 0;
      this.attemptCount = data.attemptCount || 1;
      this.hintCount = data.hintCount || 0;
    }
  }
}

export class QuestionGrade implements IQuestionGrade {
  @Expose()
  @JSONSchema({
    description: 'Question ID',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @Transform(ObjectIdToString.transformer, { toPlainOnly: true })
  @Transform(StringToObjectId.transformer, { toClassOnly: true })
  questionId: string | ObjectId;

  @Expose()
  confidenceScore: ConfidenceScore;

  @Expose()
  result: boolean;

  constructor(data: IQuestionGrade) {
    this.questionId = data.questionId;
    this.confidenceScore = data.confidenceScore;
    this.result = data.result;
  }
}

export class ScoringWeights implements IScoringWeights {
  @Expose()
  @JSONSchema({
    description: 'Unique identifier',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @Transform(ObjectIdToString.transformer, { toPlainOnly: true })
  _id?: ObjectId;

  @Expose()
  highWeight: number;

  @Expose()
  lowWeight: number;

  @Expose()
  hintPenalty: number;

  @Expose()
  streakBonus: number;

  @Expose()
  timeWeight: number;

  @Expose()
  attemptPenalty: number;

  @Expose()
  @Type(() => Date)
  createdAt?: Date;

  @Expose()
  @Type(() => Date)
  updatedAt?: Date;

  constructor(data?: Partial<IScoringWeights>) {
    if (data) {
      this._id = data._id as ObjectId;
      this.highWeight = data.highWeight;
      this.lowWeight = data.lowWeight;
      this.hintPenalty = data.hintPenalty;
      this.streakBonus = data.streakBonus;
      this.timeWeight = data.timeWeight;
      this.attemptPenalty = data.attemptPenalty;
    }
  }
}

export class ScoringResponse implements IScoringResponse {
  @Expose()
  totalScore: number;

  @Expose()
  @Type(() => ScoreBreakdown)
  breakdown: IScoreBreakdown;

  @Expose()
  pointsAdded: number;

  constructor(data: IScoringResponse) {
    this.totalScore = data.totalScore;
    this.breakdown = new ScoreBreakdown(data.breakdown);
    this.pointsAdded = data.pointsAdded;
  }
}

export class ScoreBreakdown implements IScoreBreakdown {
  @Expose()
  basePoints: number;

  @Expose()
  confidenceScore: number;

  @Expose()
  totalHintPenalty: number;

  @Expose()
  streakBonusTotal: number;

  @Expose()
  timeBonus: number;

  @Expose()
  totalAttemptPenalty: number;

  constructor(data: IScoreBreakdown) {
    this.basePoints = data.basePoints;
    this.confidenceScore = data.confidenceScore;
    this.totalHintPenalty = data.totalHintPenalty;
    this.streakBonusTotal = data.streakBonusTotal;
    this.timeBonus = data.timeBonus;
    this.totalAttemptPenalty = data.totalAttemptPenalty;
  }
}