import { ObjectId } from 'mongodb';
import {
  ISOLSolution,
  ISMLSolution,
  IOTLSolution,
  INATSolution,
  IDESSolution,
  IMTLSolution,
  ILotItem,
  ISOLQuizView,
  ISMLQuizView,
  ILotOrder,
  IOTLQuizView,
  INATQuizView,
  IDESQuizView,
  IMTLQuizView,
  IQuestionParameter,
  IQuestion,
  QuestionType,
} from 'shared/interfaces/quiz';

interface QuestionBody {
  question: IQuestion;
  solution:
    | ISOLSolution
    | ISMLSolution
    | IOTLSolution
    | INATSolution
    | IDESSolution
    | IMTLSolution;
}

abstract class BaseQuestion implements IQuestion {
  _id?: string | ObjectId;
  text: string;
  type: QuestionType;
  isParameterized: boolean;
  parameters?: IQuestionParameter[];
  hint?: string;
  timeLimitSeconds: number;
  points: number;

  constructor(question: IQuestion) {
    this._id = question._id;
    this.text = question.text;
    this.type = question.type;
    this.isParameterized = question.isParameterized;
    this.parameters = question.parameters;
    this.hint = question.hint;
    this.timeLimitSeconds = question.timeLimitSeconds;
    this.points = question.points;
  }
}

class SOLQuestion extends BaseQuestion implements ISOLSolution {
  incorrectLotItems: ILotItem[];
  correctLotItem: ILotItem;

  constructor(question: IQuestion, solution: ISOLSolution) {
    super(question);
    this.incorrectLotItems = solution.incorrectLotItems;
    this.correctLotItem = solution.correctLotItem;
  }

  toQuizView(): ISOLQuizView {
    return {
      ...this,
      lot: this.incorrectLotItems.concat(this.correctLotItem),
    };
  }
}

class SMLQuestion extends BaseQuestion implements ISMLSolution {
  incorrectLotItems: ILotItem[];
  correctLotItems: ILotItem[];

  constructor(question: IQuestion, solution: ISMLSolution) {
    super(question);
    this.incorrectLotItems = solution.incorrectLotItems;
    this.correctLotItems = solution.correctLotItems;
  }

  toQuizView(): ISMLQuizView {
    return {
      ...this,
      lot: this.incorrectLotItems.concat(this.correctLotItems),
    };
  }
}

class OTLQuestion extends BaseQuestion implements IOTLSolution {
  ordering: ILotOrder[];

  constructor(question: IQuestion, solution: IOTLSolution) {
    super(question);
    this.ordering = solution.ordering;
  }

  toQuizView(): IOTLQuizView {
    return {
      ...this,
      lot: this.ordering.map(o => o.lotItem),
    };
  }
}

class NATQuestion extends BaseQuestion implements INATSolution {
  decimalPrecision: number;
  upperLimit: number;
  lowerLimit: number;
  value?: number;
  expression?: string;

  constructor(question: IQuestion, solution: INATSolution) {
    super(question);
    this.decimalPrecision = solution.decimalPrecision;
    this.upperLimit = solution.upperLimit;
    this.lowerLimit = solution.lowerLimit;
    this.value = solution.value;
    this.expression = solution.expression;
  }

  toQuizView(): INATQuizView {
    return { ...this };
  }
}

class DESQuestion extends BaseQuestion implements IDESSolution {
  solutionText: string;

  constructor(question: IQuestion, solution: IDESSolution) {
    super(question);
    this.solutionText = solution.solutionText;
  }

  toQuizView(): IDESQuizView {
    return { ...this };
  }
}

class MTLQuestion extends BaseQuestion implements IMTLSolution {
  matches: { match: ILotItem[] }[];

  constructor(question: IQuestion, solution: IMTLSolution) {
    super(question);
    this.matches = solution.matches;
  }

  toQuizView(): IMTLQuizView {
    return { ...this };
  }
}

class QuestionFactory {
  static createQuestion(
    body: QuestionBody
  ): SOLQuestion | SMLQuestion | OTLQuestion | NATQuestion | DESQuestion | MTLQuestion {
    const { question, solution } = body;
    switch (question.type) {
      case 'SELECT_ONE_IN_LOT':
        return new SOLQuestion(question, solution as ISOLSolution);
      case 'SELECT_MANY_IN_LOT':
        return new SMLQuestion(question, solution as ISMLSolution);
      case 'ORDER_THE_LOTS':
        return new OTLQuestion(question, solution as IOTLSolution);
      case 'NUMERIC_ANSWER_TYPE':
        return new NATQuestion(question, solution as INATSolution);
      case 'DESCRIPTIVE':
        return new DESQuestion(question, solution as IDESSolution);
      case 'MATCH_THE_LOTS':
        return new MTLQuestion(question, solution as IMTLSolution);
      default:
        throw new Error('Invalid question type');
    }
  }
}

export {
  BaseQuestion,
  SOLQuestion,
  SMLQuestion,
  OTLQuestion,
  NATQuestion,
  DESQuestion,
  MTLQuestion,
  QuestionFactory,
};
