import 'reflect-metadata';
import {
  JsonController,
  Authorized,
  Post,
  Put,
  Body,
  Params,
  HttpCode,
  OnUndefined,
  BadRequestError,
  NotFoundError,
  HttpError,
} from 'routing-controllers';
import { Service, Inject } from 'typedi';
import {
  CreateQuestionBody,
  UpdateQuestionBody,
} from '../classes/validators/QuestionValidator';
import { QuestionFactory } from '../classes/transformers/Question';
import { QuestionProcessor } from '../question-processing/QuestionProcessor';
import { QuestionService } from '../services/QuestionService';

// ✅ Custom ConflictError class (since routing-controllers doesn't export one)
class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

@JsonController('/questions')
@Service()
export class QuestionController {
  constructor(
    @Inject(() => QuestionService)
    private readonly questionService: QuestionService
  ) {}

  @Authorized(['admin', 'instructor'])
  @Post('/', { transformResponse: true })
  @HttpCode(201)
  @OnUndefined(201)
  async create(@Body() body: CreateQuestionBody) {
    const question = QuestionFactory.createQuestion(body);
    try {
      const questionProcessor = new QuestionProcessor(question);
      questionProcessor.validate();

      const renderedQuestion = questionProcessor.render();
      return renderedQuestion;
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  }

  @Authorized(['admin'])
  @Put('/quizzes/:quizId/questions/:questionId')
  @HttpCode(200)
  async updateQuestion(
    @Params() params: { quizId: string; questionId: string },
    @Body() body: UpdateQuestionBody
  ) {
    const { quizId, questionId } = params;

    try {
      const question = QuestionFactory.createQuestion(body);

      const processor = new QuestionProcessor(question);
      processor.validate();

      const updated = await this.questionService.updateQuestionInQuiz(
        quizId,
        questionId,
        question
      );

      if (!updated) {
        throw new NotFoundError('Quiz or question not found.');
      }

      return { message: 'Question updated successfully in the quiz.' };
    } catch (err: any) {
      if (
        err.message.includes('Invalid') ||
        err.message.includes('<QParam>')
      ) {
        throw new BadRequestError(err.message);
      }
      if (err.message.includes('conflict')) {
        throw new ConflictError(err.message);
      }
      throw err;
    }
  }
}
