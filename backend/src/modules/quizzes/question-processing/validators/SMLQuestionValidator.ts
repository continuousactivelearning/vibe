import {SMLQuestion} from '../../classes/transformers';
import {TagParser} from 'modules/quizzes/question-processing/tag-parser/TagParser';
import {ILotItem} from 'shared/interfaces/quiz';
import {BaseQuestionValidator} from './BaseQuestionValidator';

export class SMLQuestionValidator extends BaseQuestionValidator {
  declare tagStatus: {
    questionHasTag?: boolean;
    hintHasTag?: boolean;
    lotItemsWithTag?: boolean[];
    anyLotItemHasTag?: boolean;
    anyLotItemExplainationHasTag?: boolean;
  };

  declare question: SMLQuestion;
  declare tagParserEngine: TagParser;
  lotItems: ILotItem[];

  constructor(question: SMLQuestion, tagParserEngine: TagParser) {
    super(question, tagParserEngine);
    this.tagParserEngine = tagParserEngine;
    this.question = question;

    this.lotItems = [
      ...question.correctLotItems,
      ...question.incorrectLotItems,
    ];

    this.tagStatus = {
      anyLotItemHasTag: this.lotItems.some(item =>
        tagParserEngine.isAnyValidTagPresent(item.text),
      ),
      anyLotItemExplainationHasTag: this.lotItems.some(item =>
        tagParserEngine.isAnyValidTagPresent(item.explaination),
      ),
      lotItemsWithTag: this.lotItems.map(
        item =>
          tagParserEngine.isAnyValidTagPresent(item.text) ||
          tagParserEngine.isAnyValidTagPresent(item.explaination),
      ),
    };
  }

  validate(): void {
    super.validate();

    if (this.question.isParameterized && this.question.parameters) {
      this.question.parameters.forEach(param => {
        const paramTag = `<QParam name="${param.name}">`;
        if (!this.question.text.includes(paramTag)) {
          throw new Error(
            `Question text must include parameter "${param.name}" enclosed in <QParam> tags`,
          );
        }
      });
    }

    const lotItemIds = this.lotItems.map(item => (item as any).id);
    const uniqueIds = new Set(lotItemIds);
    if (uniqueIds.size !== lotItemIds.length) {
      throw new Error('Duplicate lotItem IDs found');
    }

    if (this.question.isParameterized) {
      if (!this.tagStatus.anyLotItemHasTag) {
        throw new Error('At least one LotItem must contain a valid tag.');
      }

      this.tagStatus.lotItemsWithTag?.forEach((hasTag, index) => {
        const item = this.lotItems[index];

        if (this.tagParserEngine.isAnyValidTagPresent(item.text)) {
          this.tagParserEngine.validateTags(
            item.text,
            this.question.parameters,
          );
        }

        if (this.tagParserEngine.isAnyValidTagPresent(item.explaination)) {
          this.tagParserEngine.validateTags(
            item.explaination,
            this.question.parameters,
          );
        }
      });

      if (
        this.question.hint &&
        this.tagParserEngine.isAnyValidTagPresent(this.question.hint)
      ) {
        this.tagStatus.hintHasTag = true;
        this.tagParserEngine.validateTags(
          this.question.hint,
          this.question.parameters,
        );
      }
    }
  }
}
