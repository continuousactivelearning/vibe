const TYPES = {
  //Controllers
  QuestionController: Symbol.for('QuestionController'),
  LivePollController: Symbol.for('LivePollController'),

  //Services
  QuestionService: Symbol.for('QuestionService'),
  AttemptService: Symbol.for('AttemptService'),
  QuestionBankService: Symbol.for('QuestionBankService'),
  QuizService: Symbol.for('QuizService'),
  LivePollService: Symbol.for('LivePollService'),

  //Repositories
  QuestionRepo: Symbol.for('QuestionRepo'),
  QuestionBankRepo: Symbol.for('QuestionBankRepo'),
  QuizRepo: Symbol.for('QuizRepo'),
  AttemptRepo: Symbol.for('AttemptRepo'),
  SubmissionRepo: Symbol.for('SubmissionRepo'),
  UserQuizMetricsRepo: Symbol.for('UserQuizMetricsRepo'),
};

interface LivePollInput {
  question: string;
  options: string[];
  duration?: number;
}

interface LivePoll extends LivePollInput {
  id: string;
  createdBy: string;
  createdAt: number;
}

export { TYPES as QUIZZES_TYPES, LivePollInput, LivePoll };