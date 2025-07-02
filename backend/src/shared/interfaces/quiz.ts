import { ObjectId } from 'mongodb';

type QuestionType =
  | 'SELECT_ONE_IN_LOT'
  | 'SELECT_MANY_IN_LOT'
  | 'ORDER_THE_LOTS'
  | 'NUMERIC_ANSWER_TYPE'
  | 'DESCRIPTIVE'
  | 'MATCH_THE_LOTS'; // ✅ added

interface IQuestionParameter {
  name: string;
  possibleValues: string[];
  type: 'number' | 'string';
}

interface IQuestion {
  _id?: string | ObjectId;
  text: string;
  type: QuestionType;
  isParameterized: boolean;
  parameters?: IQuestionParameter[];
  hint?: string;
  timeLimitSeconds: number;
  points: number;
}

interface INATSolution {
  decimalPrecision: number;
  upperLimit: number;
  lowerLimit: number;
  value?: number;
  expression?: string;
}

interface ILotItem {
  _id?: string | ObjectId;
  text: string;
  explaination: string;
}

interface ILotOrder {
  lotItem: ILotItem;
  order: number;
}

interface IOTLSolution {
  ordering: ILotOrder[];
}

interface ISOLSolution {
  incorrectLotItems: ILotItem[];
  correctLotItem: ILotItem;
}

interface ISMLSolution {
  incorrectLotItems: ILotItem[];
  correctLotItems: ILotItem[];
}

interface IDESSolution {
  solutionText: string;
}

type QuestionQuizView = Omit<IQuestion, 'hint'>;

interface ISOLQuizView extends QuestionQuizView {
  lot: ILotItem[];
}

interface ISMLQuizView extends QuestionQuizView {
  lot: ILotItem[];
}

interface IOTLQuizView extends QuestionQuizView {
  lot: ILotItem[];
}

type INATQuizView = QuestionQuizView;
type IDESQuizView = QuestionQuizView;

// ✅ ✅ ✅ ADD BELOW FOR MTL SUPPORT

interface IMatchItem {
  text: string;
  explaination: string;
}

interface IMatch {
  match: IMatchItem[];
}

interface IMTLSolution {
  matches: IMatch[];
}

interface IMTLQuizView extends QuestionQuizView {
  matches: IMatch[];
}

export {
  IQuestion,
  IQuestionParameter,
  ISOLSolution,
  ISMLSolution,
  IOTLSolution,
  INATSolution,
  IDESSolution,
  IMTLSolution,       // ✅ export it
  ILotItem,
  ILotOrder,
  ISOLQuizView,
  ISMLQuizView,
  IOTLQuizView,
  INATQuizView,
  IDESQuizView,
  IMTLQuizView,       // ✅ export it
  QuestionType,
  QuestionQuizView,
};
