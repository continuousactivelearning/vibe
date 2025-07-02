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

// ✅ Custom ConflictError (since routing-controllers doesn't export it)
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
    try {
      const question = QuestionFactory.createQuestion(body);
      const processor = new QuestionProcessor(question);
      processor.validate();

      const rendered = processor.render();
      return rendered;
    } catch (err: any) {
      throw new BadRequestError(err.message);
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
      const msg = err.message || '';
      if (msg.includes('Invalid') || msg.includes('<QParam>')) {
        throw new BadRequestError(msg);
      }
      if (msg.includes('conflict')) {
        throw new ConflictError(msg);
      }
      throw err;
    }
  }
}
