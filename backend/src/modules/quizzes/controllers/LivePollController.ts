import {
  JsonController, Post, Body, Get, Param, CurrentUser, Authorized
} from 'routing-controllers';
import { inject, injectable } from 'inversify';
import { LivePollService } from '../services/LivePollService.js';
import { LivePollInput } from '../types.js';
import { QUIZZES_TYPES } from '../types.js';
import { Server } from 'socket.io';

@injectable()
@JsonController('/quizzes')
export class LivePollController {
  constructor(
    @inject(QUIZZES_TYPES.LivePollService) private pollService: LivePollService,
    @inject('SocketIO') private io: Server
  ) {}

  @Authorized(['teacher'])
  @Post('/live-poll')
  async createLivePoll(@Body() body: LivePollInput, @CurrentUser() user: any) {
    const poll = this.pollService.create(body, user.id);
    this.io.emit('new_poll', poll);

    setTimeout(() => {
      this.io.emit('poll_timeout', { pollId: poll.id });
    }, poll.duration * 1000);

    return { message: 'Poll created', poll };
  }

  @Get('/live-poll/active')
  getActivePoll() {
    return this.pollService.getActive();
  }

  @Authorized(['student'])
  @Post('/live-poll/answer')
  submitPollAnswer(
    @Body() body: { pollId: string; answerIndex: number },
    @CurrentUser() user: any
  ) {
    const success = this.pollService.submitAnswer(body.pollId, user.id, body.answerIndex);
    return { success };
  }

  @Authorized(['teacher'])
  @Get('/live-poll/results/:id')
  getResults(@Param('id') id: string) {
    const results = this.pollService.getResults(id);
    return results;
  }
}
