import { ObjectId } from 'mongodb';

// ----------------------------------------
// Core Question Types
// ----------------------------------------

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

// ----------------------------------------
// Shared Items
// ----------------------------------------

interface ILotItem {
  _id?: string | ObjectId;
  text: string;
  explaination: string;
}

interface ILotOrder {
  lotItem: ILotItem;
  order: number;
}

// ----------------------------------------
// Solutions
// ----------------------------------------

interface ISOLSolution {
  incorrectLotItems: ILotItem[];
  correctLotItem: ILotItem;
}

interface ISMLSolution {
  incorrectLotItems: ILotItem[];
  correctLotItems: ILotItem[];
}

interface IOTLSolution {
  ordering: ILotOrder[];
}

interface INATSolution {
  decimalPrecision: number;
  upperLimit: number;
  lowerLimit: number;
  value?: number;
  expression?: string;
}

interface IDESSolution {
  solutionText: string;
}

// ✅ MATCH_THE_LOTS Solution
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

// ----------------------------------------
// Quiz Views (Without Hint)
// ----------------------------------------

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

interface IMTLQuizView extends QuestionQuizView {
  matches: IMatch[];
}

type INATQuizView = QuestionQuizView;
type IDESQuizView = QuestionQuizView;

// ----------------------------------------
// Exports
// ----------------------------------------

export {
  // Core
  IQuestion,
  IQuestionParameter,
  QuestionType,
  QuestionQuizView,

  // Shared
  ILotItem,
  ILotOrder,

  // Solutions
  ISOLSolution,
  ISMLSolution,
  IOTLSolution,
  INATSolution,
  IDESSolution,
  IMTLSolution,

  // Views
  ISOLQuizView,
  ISMLQuizView,
  IOTLQuizView,
  INATQuizView,
  IDESQuizView,
  IMTLQuizView,
};
