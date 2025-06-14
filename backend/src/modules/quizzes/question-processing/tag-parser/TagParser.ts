import {IQuestionParameter} from 'shared/interfaces/quiz';
import {Tag, ParameterMap} from './tags/Tag';

class TagParser {
  constructor(private processors: Record<string, Tag>) {}
  processText(text: string, context: ParameterMap): string {
    return text.replace(
      /<(\w+)([^>]*)>(.*?)<\/\1>/gs,
      (_, tagName, attrs, inner) => {
        const processor = this.processors[tagName];
        if (!processor) {
          return inner;
        }
        return processor.process(inner, context);
      },
    );
  }

  isAnyValidTagPresent(text: string): boolean {
    const allContents: string[] = [];

    for (const processor of Object.values(this.processors)) {
      const tagContents = processor.extract(text);
      allContents.push(...tagContents);
    }

    return allContents.length > 0;
  }

  validateTags(text: string, parameters?: IQuestionParameter[]): void {
    text.replace(
      /<(\w+)([^>]*)>(.*?)<\/\1>/gs,
      (matchString, tagName, attrs, inner) => {
        const processor = this.processors[tagName];
        if (processor) {
          processor.validate(inner, parameters);
        }
        return matchString;
      },
    );
  }
}
export {TagParser};
