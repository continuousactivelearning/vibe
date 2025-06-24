import {sharedContainerModule} from '#root/container.js';
import {InversifyAdapter} from '#root/inversify-adapter.js';
import {Container, ContainerModule} from 'inversify';
import {RoutingControllersOptions, useContainer} from 'routing-controllers';
import {quizzesContainerModule} from './container.js';
import {QuestionController} from './controllers/QuestionController.js';
import {QuestionBankController} from './controllers/QuestionBankController.js';
import {coursesContainerModule} from '#courses/container.js';
import {AttemptController} from './controllers/AttemptController.js';
import {QuizController} from './controllers/QuizController.js';
import { } from './classes/validators/QuestionBankValidator.js';
import { QUESTIONBANK_VALIDATORS, QUESTION_VALIDATORS, QUIZ_VALIDATORS } from './classes/validators/index.js';
import { } from './classes/validators/QuizValidator.js';
import { LivePollController } from './controllers/LivePollController.js';

export const quizzesContainerModules: ContainerModule[] = [
  quizzesContainerModule,
  sharedContainerModule,
  coursesContainerModule,
];

export const quizzesModuleControllers: Function[] = [
  QuestionController,
  QuestionBankController,
  AttemptController,
  QuizController,
  LivePollController,
];

export async function setupQuizzesContainer(
  //io: import('socket.io').Server
  ): Promise<void> {
  const container = new Container();
  await container.load(...quizzesContainerModules);
  // 👇 Manually bind the Socket.IO instance for DI
  // container.bind<import('socket.io').Server>('SocketIO').toConstantValue(io);
  const inversifyAdapter = new InversifyAdapter(container);
  useContainer(inversifyAdapter);
}

export const quizzesModuleOptions: RoutingControllersOptions = {
  controllers: quizzesModuleControllers,
  middlewares: [],
  defaultErrorHandler: true,
  authorizationChecker: async function () {
    return true;
  },
  validation: true,
};

export const quizzesModuleValidators: Function[] = [
  ...QUESTIONBANK_VALIDATORS,
  ...QUESTION_VALIDATORS,
  ...QUIZ_VALIDATORS
]
