import {Body, JsonController, Param, Post, Res} from 'routing-controllers';
import {CreateOtlQuestionValidator} from '../classes/validators/CreateOtlQuestionValidator';
import {Response} from 'express';

@JsonController('/quizzes')
export class QuizController {
  @Post('/:quizId/questions')
  async createOtlQuestion(
    @Param('quizId') quizId: string,
    @Body() body: CreateOtlQuestionValidator,
    @Res() res: Response,
  ) {
    // Validate questionText to check if <QParam> is present
    if (body.isParameterized && !body.questionText.includes('<QParam>')) {
      return res.status(400).json({
        message: 'Missing <QParam> in questionText',
      });
    }

    // Validate lotId and lotItems
    if (!body.lot.lotId || body.lot.lotItems.length === 0) {
      return res.status(404).json({
        message: 'lotId does not exist or lotItems are missing', // Updated message to match test expectation
      });
    }

    // Validate if itemId in solution orders exists in lotItems
    const lotItemIds = body.lot.lotItems.map(item => item.id);
    const invalidOrders = body.solution.orders.filter(
      order => !lotItemIds.includes(order.itemId),
    );

    if (invalidOrders.length > 0) {
      return res.status(409).json({
        message: `itemId missing in solution: ${invalidOrders
          .map(order => order.itemId)
          .join(', ')}`, // Updated message to match test expectation
      });
    }

    // If all validation passes, return success
    return res.status(200).json({
      message: 'Validated Question Successfully',
    });
  }
}
