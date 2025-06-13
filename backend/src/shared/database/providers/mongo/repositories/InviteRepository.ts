import 'reflect-metadata';
import {instanceToPlain} from 'class-transformer';
import {Course} from 'modules/courses/classes/transformers/Course';
import {CourseVersion} from 'modules/courses/classes/transformers/CourseVersion';
import {Item, ItemsGroup} from 'modules/courses/classes/transformers/Item';
import {
  ClientSession,
  Collection,
  DeleteResult,
  MongoClient,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import {ICourseRepository} from 'shared/database/interfaces/ICourseRepository';
import {IInviteRepository} from 'shared/database/interfaces/IInviteRepository';
import {
  CreateError,
  DeleteError,
  ReadError,
  UpdateError,
} from 'shared/errors/errors';
import {
  IInvite,
  ICourse,
  IModule,
  IEnrollment,
  IProgress,
  ICourseVersion,
  ISection,
} from 'shared/interfaces/Models';
import {Service, Inject} from 'typedi';
import {MongoDatabase} from '../MongoDatabase.js';
import {NotFoundError} from 'routing-controllers';
import {Module, Section} from 'modules';
import {Invite} from 'modules/courses/classes/transformers/Invite';
import {ResultSetDependencies} from 'mathjs';

@Service()
export class InviteRepository implements IInviteRepository {
  private inviteCollection: Collection<any>;
  private courseCollection: Collection<Course>;
  private courseVersionCollection: Collection<CourseVersion>;
  private itemsGroupCollection: Collection<ItemsGroup>;

  constructor(@Inject(() => MongoDatabase) private db: MongoDatabase) {}

  private async init() {
    this.inviteCollection = await this.db.getCollection<any>('newInvite');
    this.courseCollection = await this.db.getCollection<Course>('newCourse');
    this.courseVersionCollection =
      await this.db.getCollection<CourseVersion>('newCourseVersion');
    this.itemsGroupCollection =
      await this.db.getCollection<ItemsGroup>('itemsGroup');
  }

  async getDBClient(): Promise<MongoClient> {
    const client = await this.db.getClient();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    return client;
  }

  async create(invite: any, session?: ClientSession): Promise<any> {
    await this.init();
    //const result = await this.courseCollection.insertOne(course, { session });
    try {
      console.log('HElllow wolld');
      const result = await this.inviteCollection.insertOne(invite, {session});
      return result;
    } catch {
      throw new CreateError('Failed to create invite');
    }
  }
  async findInviteByEmail(email: string): Promise<any | null> {
    await this.init(); // Ensure collection is initialized

    try {
      const invite = await this.inviteCollection.findOne({email});
      return invite;
    } catch (error) {
      console.error('❌ Failed to find invite by email:', error);
      throw new ReadError('Failed to find invite by email');
    }
  }

  async updateInvite(invite: any): Promise<void> {
    await this.init();

    if (!invite._id) {
      throw new Error('Invite must have an _id to be updated');
    }

    const {_id, ...updateData} = invite;

    const result = await this.inviteCollection.updateOne(
      {_id: new ObjectId(_id)},
      {$set: updateData},
    );

    if (result.modifiedCount === 0) {
      throw new UpdateError(`Failed to update invite with ID: ${_id}`);
    }
  }

  async findInviteByToken(token: string): Promise<any | null> {
    await this.init(); // Ensure collection is initialized

    try {
      const invite = await this.inviteCollection.findOne({token});
      return invite;
    } catch (error) {
      console.error('❌ Failed to find invite by token:', error);
      throw new ReadError('Failed to find invite by token');
    }
  }
}
