﻿import {SMLQuestion} from '#quizzes/classes/transformers/Question.js';
import {ILotItem} from '#root/shared/interfaces/quiz.js';
import {TagParser} from '../tag-parser/TagParser.js';
import {ParameterMap} from '../tag-parser/tags/Tag.js';
import {BaseQuestionRenderer} from './BaseQuestionRenderer.js';
import {SMLQuestionRenderView} from './interfaces/RenderViews.js';

class SMLQuestionRenderer extends BaseQuestionRenderer {
  declare question: SMLQuestion;
  declare tagParser: TagParser;

  constructor(question: SMLQuestion, tagParser: TagParser) {
    super(question, tagParser);
  }

  render(parameterMap: ParameterMap): SMLQuestionRenderView {
    const renderedQuestion: SMLQuestion = super.render(
      parameterMap,
    ) as SMLQuestion;

    // Combine all lot items (correct and incorrect)
    const lotItems: ILotItem[] = [
      ...renderedQuestion.correctLotItems,
      ...renderedQuestion.incorrectLotItems,
    ];

    // Process text and explanation for each lot item
    const processedLotItems = lotItems.map(item => ({
      ...item,
      text: this.tagParser.processText(item.text, parameterMap),
      explaination: this.tagParser.processText(item.explaination, parameterMap),
    }));

    // Shuffle the lot items
    const shuffledLotItems = processedLotItems.sort(() => Math.random() - 0.5);

    const renderedQuestionWithLotItems: SMLQuestionRenderView = {
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

export {SMLQuestionRenderer};
