import 'reflect-metadata';
import {
  JsonController,
  Authorized,
  Post,
  Body,
  HttpCode,
  OnUndefined,
  BadRequestError,
  Params,
} from 'routing-controllers';
import {Service} from 'typedi';
import {CreateQuestionBody} from '../classes/validators/QuestionValidator';
import {QuestionFactory} from '../classes/transformers/Question';
import {QuestionProcessor} from '../question-processing/QuestionProcessor';
import {TagParser} from '../question-processing/tag-parser/TagParser';
import {SMLQuestionValidator} from '../question-processing/validators/SMLQuestionValidator';
import {SMLQuestion} from '../classes/transformers/Question';
import {Tag} from '../question-processing/tag-parser/tags/Tag';
@JsonController('/quizzes')
@Service()
export class QuestionController {
  constructor() {}

  @Authorized(['admin', 'instructor'])
  @Post('/:quizId/questions')
  @HttpCode(201)
  @OnUndefined(201)
  async create(
    @Params() params: {quizId: string},
    @Body() body: CreateQuestionBody,
  ) {
    const question = QuestionFactory.createQuestion(body);
    try {
      if (question.type === 'SELECT_MANY_IN_LOT') {
        const processors: Record<string, Tag> = {};
        const tagParser = new TagParser(processors);
        const validator = new SMLQuestionValidator(
          question as SMLQuestion,
          tagParser,
        );
        validator.validate();
      }

      const questionProcessor = new QuestionProcessor(question);
      questionProcessor.validate();
      const renderedQuestion = questionProcessor.render();
      console.log(`Created question for quiz: ${params.quizId}`);
      return renderedQuestion;
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  }
}
