import {MongoDatabase} from '#root/shared/database/providers/mongo/MongoDatabase.js';
import {IQuestionBank} from '#root/shared/interfaces/quiz.js';
import {GLOBAL_TYPES} from '#root/types.js';

import {injectable, inject} from 'inversify';
import {Collection, ClientSession} from 'mongodb';

@injectable()
class QuestionBankRepository {
  private questionBankCollection: Collection<IQuestionBank>;
  constructor(
    @inject(GLOBAL_TYPES.Database)
    private db: MongoDatabase,
  ) {}

  private async init() {
    this.questionBankCollection =
      await this.db.getCollection<IQuestionBank>('questionBanks');
  }

  public async create(
    questionBank: IQuestionBank,
    session?: ClientSession,
  ): Promise<string> {
    await this.init();
    const result = await this.questionBankCollection.insertOne(questionBank, {
      session,
    });
    if (result.acknowledged && result.insertedId) {
      return result.insertedId.toString();
    }
    throw new Error('Failed to create question bank');
  }

  public async getById(
    questionBankId: string,
    session?: ClientSession,
  ): Promise<IQuestionBank | null> {
    await this.init();
    const result = await this.questionBankCollection.findOne(
      {_id: questionBankId},
      {session},
    );
    if (!result) {
      return null;
    }
    return result;
  }

  public async removeQuestionFromAllBanks(
    questionId: string,
    session?: ClientSession,
  ): Promise<number> {
    await this.init();

    const result = await this.questionBankCollection.updateMany(
      {questions: questionId},
      {$pull: {questions: questionId}},
      {session},
    );

    return result.modifiedCount; // number of banks updated
  }

  public async update(
    questionBankId: string,
    updateData: Partial<IQuestionBank>,
    session?: ClientSession,
  ): Promise<IQuestionBank | null> {
    await this.init();
    const result = await this.questionBankCollection.findOneAndUpdate(
      {_id: questionBankId},
      {$set: updateData},
      {returnDocument: 'after', session},
    );
    if (!result) {
      return null;
    }
    return result;
  }

  public async delete(
    questionBankId: string,
    session?: ClientSession,
  ): Promise<boolean> {
    await this.init();
    const result = await this.questionBankCollection.deleteOne(
      {_id: questionBankId},
      {session},
    );
    return result.deletedCount === 0;
  }
}

export {QuestionBankRepository};
