import {DESQuestion} from '#quizzes/classes/index.js';
import {ParameterMap} from '../tag-parser/index.js';
import {TagParser} from '../tag-parser/TagParser.js';
import {BaseQuestionRenderer} from './BaseQuestionRenderer.js';
import {DESQuestionRenderView} from './interfaces/RenderViews.js';

class DESQuestionRenderer extends BaseQuestionRenderer {
  declare question: DESQuestion;
  declare tagParser: TagParser;

  constructor(question: DESQuestion, tagParser: TagParser) {
    super(question, tagParser);
  }

  render(parameterMap: ParameterMap): DESQuestionRenderView {
    const renderedQuestion: DESQuestion = super.render(
      parameterMap,
    ) as DESQuestion;

    // Process solutionText with parameter values if present
    const processedSolutionText = renderedQuestion.solutionText
      ? this.tagParser.processText(renderedQuestion.solutionText, parameterMap)
      : '';

    const renderedQuestionView: DESQuestionRenderView = {
      _id: renderedQuestion._id,
      type: renderedQuestion.type,
      isParameterized: renderedQuestion.isParameterized,
      text: renderedQuestion.text,
      hint: renderedQuestion.hint,
      points: renderedQuestion.points,
      timeLimitSeconds: renderedQuestion.timeLimitSeconds,
      parameterMap: parameterMap,
    };

    return renderedQuestionView;
  }
}

export {DESQuestionRenderer};
