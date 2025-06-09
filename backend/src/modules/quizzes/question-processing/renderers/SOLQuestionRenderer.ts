import {SOLQuestion} from '#quizzes/classes/transformers/Question.js';
import {ILotItem} from '#root/shared/interfaces/quiz.js';
import {TagParser} from '../tag-parser/TagParser.js';
import {ParameterMap} from '../tag-parser/tags/Tag.js';
import {BaseQuestionRenderer} from './BaseQuestionRenderer.js';
import {SOLQuestionRenderView} from './interfaces/RenderViews.js';

class SOLQuestionRenderer extends BaseQuestionRenderer {
  declare question: SOLQuestion;
  declare tagParser: TagParser;

  constructor(question: SOLQuestion, tagParser: TagParser) {
    super(question, tagParser);
  }
  render(parameterMap?: ParameterMap): SOLQuestionRenderView {
    const renderedQuestion: SOLQuestion = super.render(
      parameterMap,
    ) as SOLQuestion;

    const lotItems: ILotItem[] = [
      renderedQuestion.correctLotItem,
      ...renderedQuestion.incorrectLotItems,
    ];

    //Shuffle lot items
    let shuffledLotItems = lotItems.sort(() => Math.random() - 0.5);

    if (parameterMap) {
      // Process text in lot items using the tag parser
      shuffledLotItems = lotItems.map(item => ({
        ...item,
        text: this.tagParser.processText(item.text, parameterMap),
        explaination: this.tagParser.processText(
          item.explaination,
          parameterMap,
        ),
      }));
    }

    const renderedQuestionWithLotItems: SOLQuestionRenderView = {
      _id: renderedQuestion._id,
      type: renderedQuestion.type,
      isParameterized: renderedQuestion.isParameterized,
      text: renderedQuestion.text,
      hint: renderedQuestion.hint,
      points: renderedQuestion.points,
      timeLimitSeconds: renderedQuestion.timeLimitSeconds,
      lotItems: shuffledLotItems,
      parameterMap: parameterMap,
    };

    return renderedQuestionWithLotItems;
  }
}

export {SOLQuestionRenderer};
