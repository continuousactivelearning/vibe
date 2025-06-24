import { injectable } from 'inversify';
import { LivePoll, LivePollInput } from '../types.js';
import { generatePollId } from '../utils/generatePollId.js';

interface PollAnswer {
  pollId: string;
  userId: string;
  answerIndex: number;
}

@injectable()
export class LivePollService {
  private activePoll: LivePoll | null = null;
  private pollAnswers: PollAnswer[] = [];

  create(input: LivePollInput, teacherId: string): LivePoll {
    const poll: LivePoll = {
      id: generatePollId(),
      question: input.question,
      options: input.options,
      duration: input.duration ?? 60,
      createdBy: teacherId,
      createdAt: Date.now(),
    };
    this.activePoll = poll;
    this.pollAnswers = [];
    return poll;
  }

  getActive(): LivePoll | null {
    if (!this.activePoll) return null;

    const expired = Date.now() > this.activePoll.createdAt + this.activePoll.duration * 1000;
    return expired ? null : this.activePoll;
  }

  submitAnswer(pollId: string, userId: string, answerIndex: number): boolean {
    const existing = this.pollAnswers.find(a => a.userId === userId && a.pollId === pollId);
    if (existing) return false;
    this.pollAnswers.push({ pollId, userId, answerIndex });
    return true;
  }

  getResults(pollId: string): Record<string, number> {
    if (!this.activePoll || this.activePoll.id !== pollId) return {};

    const counts = Array(this.activePoll.options.length).fill(0);
    this.pollAnswers.forEach(a => {
      if (a.pollId === pollId) counts[a.answerIndex]++;
    });

    return this.activePoll.options.reduce((acc, option, index) => {
      acc[option] = counts[index];
      return acc;
    }, {} as Record<string, number>);
  }
}
