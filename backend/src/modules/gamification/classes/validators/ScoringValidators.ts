import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsArray,
  IsIn,
  IsMongoId,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';
import { ConfidenceScore, IQuestionGrade, IQuizAttempt, IScoringWeights } from '#gamification/interfaces/scoring.js';

export class QuestionGradeValidator implements IQuestionGrade {
  @JSONSchema({
    description: 'Question ID',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @IsNotEmpty()
  @IsMongoId()
  questionId: string;

  @JSONSchema({
    description: 'Confidence score (1-5)',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 2, 3, 4, 5])
  confidenceScore: ConfidenceScore;

  @JSONSchema({
    description: 'Whether answer was correct',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  result: boolean;
}

export class QuizAttemptValidator implements IQuizAttempt {
  @JSONSchema({
    description: 'User ID',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @JSONSchema({
    description: 'Quiz ID',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
  })
  @IsNotEmpty()
  @IsMongoId()
  quizId: string;

  @JSONSchema({
    description: 'Attempt ID',
    example: '60d5ec49b3f1c8e4a8f8b8c3',
  })
  @IsNotEmpty()
  @IsMongoId()
  attemptId: string;

  @JSONSchema({
    description: 'Metric ID',
    example: '60d5ec49b3f1c8e4a8f8b8c4',
  })
  @IsNotEmpty()
  @IsMongoId()
  metricId: string;

  @JSONSchema({
    description: 'Question grades',
    type: 'array',
    items: { $ref: '#/components/schemas/QuestionGradeValidator' }
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => QuestionGradeValidator)
  grades: QuestionGradeValidator[];

  @JSONSchema({
    description: 'Consecutive correct answers',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  streaks: number;

  @JSONSchema({
    description: 'Time taken (seconds)',
    example: 300,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  timeTaken: number;

  @JSONSchema({
    description: 'Ideal time (seconds)',
    example: 600,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  idealTime: number;

  @JSONSchema({
    description: 'Attempt count',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  attemptCount: number;

  @JSONSchema({
    description: 'Hints used',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  hintCount: number;
}
export class ScoringWeightsValidator implements Omit<IScoringWeights, '_id'> {
  @JSONSchema({
    description: 'High confidence weight',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  highWeight: number;

  @JSONSchema({
    description: 'Low confidence weight',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  lowWeight: number;

  @JSONSchema({
    description: 'Hint penalty',
    example: -0.5,
  })
  @IsNotEmpty()
  @IsNumber()
  hintPenalty: number;

  @JSONSchema({
    description: 'Streak bonus',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  streakBonus: number;

  @JSONSchema({
    description: 'Time weight',
    example: 0.2,
  })
  @IsNotEmpty()
  @IsNumber()
  timeWeight: number;

  @JSONSchema({
    description: 'Attempt penalty',
    example: -0.5,
  })
  @IsNotEmpty()
  @IsNumber()
  attemptPenalty: number;
}

export const SCORING_VALIDATORS = [
  QuestionGradeValidator,
  QuizAttemptValidator,
  ScoringWeightsValidator,
];