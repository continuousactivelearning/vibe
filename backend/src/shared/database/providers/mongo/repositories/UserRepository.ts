import {User} from '#auth/index.js';
import {GLOBAL_TYPES} from '#root/types.js';
import {IUserRepository} from '#shared/database/interfaces/IUserRepository.js';
import {IUser, IUserAnomaly} from '#shared/interfaces/models.js';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {injectable, inject} from 'inversify';
import {Collection, MongoClient, ClientSession, ObjectId} from 'mongodb';
import {MongoDatabase} from '../MongoDatabase.js';
import {InternalServerError, NotFoundError} from 'routing-controllers';

@injectable()
export class UserRepository implements IUserRepository {
  private usersCollection!: Collection<IUser>;

  private usersAnomalyCollection!: Collection<IUserAnomaly>;

  constructor(
    @inject(GLOBAL_TYPES.Database)
    private db: MongoDatabase,
  ) {}

  /**
   * Ensures that `usersCollection` is initialized before usage.
   */
  private async init(): Promise<void> {
    if (!this.usersCollection) {
      this.usersCollection = await this.db.getCollection<IUser>('users');
    }
    if (!this.usersAnomalyCollection) {
      this.usersAnomalyCollection =
        await this.db.getCollection<IUserAnomaly>('userAnomalies');
    }
  }

  async getDBClient(): Promise<MongoClient> {
    const client = await this.db.getClient();
    if (!client) {
      throw new Error('MongoDB client is not initialized');
    }
    return client;
  }

  /**
   * Creates a new user in the database.
   * - Generates a MongoDB `_id` internally but uses `firebaseUID` as the external identifier.
   */
  async create(user: IUser, session?: ClientSession): Promise<string> {
    await this.init();
    const result = await this.usersCollection.insertOne(user, {session});
    if (!result.acknowledged) {
      throw new InternalServerError('Failed to create user');
    }
    return result.insertedId.toString();
  }

  /**
   * Finds a user by email.
   */
  async findByEmail(
    email: string,
    session?: ClientSession,
  ): Promise<IUser | null> {
    await this.init();
    const user = await this.usersCollection.findOne({email}, {session});
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return instanceToPlain(new User(user)) as IUser;
  }

  /**
   * Finds a user by ID.
   */
  async findById(id: string | ObjectId): Promise<IUser | null> {
    await this.init();
    const user = await this.usersCollection.findOne({_id: new ObjectId(id)});
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return instanceToPlain(new User(user)) as IUser;
  }

  /**
   * Finds a user by Firebase UID.
   */
  async findByFirebaseUID(firebaseUID: string): Promise<IUser | null> {
    await this.init();
    const user = await this.usersCollection.findOne({firebaseUID});
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return instanceToPlain(new User(user)) as IUser;
  }

  /**
   * Adds a role to a user.
   */
  async addRole(firebaseUID: string, role: string): Promise<IUser | null> {
    await this.init();
    const result = await this.usersCollection.findOneAndUpdate(
      {firebaseUID},
      {$addToSet: {roles: role}},
      {returnDocument: 'after'},
    );
    return instanceToPlain(new User(result)) as IUser;
  }

  /**
   * Removes a role from a user.
   */
  async removeRole(firebaseUID: string, role: string): Promise<IUser | null> {
    await this.init();
    const result = await this.usersCollection.findOneAndUpdate(
      {firebaseUID},
      {$pull: {roles: role}},
      {returnDocument: 'after'},
    );
    return instanceToPlain(new User(result)) as IUser;
  }

  /**
   * Updates a user's password.
   */
  async updatePassword(
    firebaseUID: string,
    password: string,
  ): Promise<IUser | null> {
    await this.init();
    const result = await this.usersCollection.findOneAndUpdate(
      {firebaseUID},
      {$set: {password}},
      {returnDocument: 'after'},
    );
    return instanceToPlain(new User(result)) as IUser;
  }

  /**
   * Creates a User Anomaly Document in the database.
   */

  async createUserAnomaly(
    anamoly: IUserAnomaly,
    session?: ClientSession,
  ): Promise<IUserAnomaly | null> {
    await this.init();
    const result = await this.usersAnomalyCollection.insertOne(anamoly, {
      session,
    });
    if (!result.acknowledged) {
      throw new InternalServerError('Failed to create user anomaly');
    } else {
      const createdAnomaly = await this.usersAnomalyCollection.findOne(
        {
          _id: result.insertedId,
        },
        {session},
      );

      if (!createdAnomaly) {
        throw new NotFoundError('User anomaly not found after creation');
      }

      return createdAnomaly;
    }
  }
}
