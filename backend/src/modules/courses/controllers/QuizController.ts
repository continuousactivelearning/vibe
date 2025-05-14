import {
  JsonController,
  Post,
  Param,
  Body,
  BadRequestError,
  NotFoundError,
} from 'routing-controllers';

import {AlreadyExists} from 'shared/errors/errors';

import {CreateMtlQuestionValidator} from '../classes/validators/CreateMtlQuestionValidator';
import {validateParametersInQuestionText} from '../utils/parameterValidator';

@JsonController('/quizzes')
export class QuizController {
  @Post('/:quizId/questions')
  async createMtlQuestion(
    @Param('quizId') quizId: string,
    @Body() body: CreateMtlQuestionValidator,
  ) {
    if (body.questionType !== 'MTL') {
      throw new BadRequestError('Invalid questionType. Expected "MTL".');
    }

    const missingParams = validateParametersInQuestionText(
      body.questionText,
      body.parameters ? [body.parameters] : [],
    );

    if (missingParams.length > 0) {
      throw new BadRequestError(
        `The parameter(s) ${missingParams.join(', ')} are missing from the questionText. Please ensure all specified parameters are enclosed within <QParam></QParam> tags.`,
      );
    }

    const lotIds = new Set();
    const itemIds = new Set();

    for (const lot of body.lots) {
      if (lotIds.has(lot.lotId)) {
        throw new AlreadyExists('Lot IDs must be unique.');
      }
      lotIds.add(lot.lotId);

      for (const item of lot.lotItems) {
        if (itemIds.has(item.id)) {
          throw new AlreadyExists('Item IDs must be unique across all lots.');
        }
        itemIds.add(item.id);
      }
    }

    const allItemIds = Array.from(itemIds);

    for (const match of body.solution.MTL.matches) {
      if (match.itemIds.length !== 2) {
        throw new BadRequestError('Each match must have exactly 2 itemIds.');
      }

      const [id1, id2] = match.itemIds;

      if (id1 === id2) {
        throw new BadRequestError('An item cannot be matched to itself.');
      }

      if (!allItemIds.includes(id1) || !allItemIds.includes(id2)) {
        throw new NotFoundError(
          'The specified itemId does not exist in the lots.',
        );
      }
    }

    return {
      message: 'Created Question Successfully',
      questionId: 'q123',
      ...body,
    };
  }
}
