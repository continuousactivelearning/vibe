import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {
  Collection,
  ObjectId,
  UpdateResult,
  DeleteResult,
  ClientSession,
} from 'mongodb';

import {IGamifyLayerRepository, MongoDatabase} from '#shared/database/index.js';
import {IEvents, IRule} from '#root/shared/interfaces/models.js';
import {GLOBAL_TYPES} from '#root/types.js';
import {Events, Rule} from '#gamification/classes/transformers/index.js';

@injectable()
export class GamifyLayerRepository implements IGamifyLayerRepository {
  // Collection references
  private eventsCollection: Collection<Events>;
  private rulesCollection: Collection<Rule>;

  constructor(
    @inject(GLOBAL_TYPES.Database)
    private db: MongoDatabase,
  ) {}

  private initialized = false;

  

  private async init() {
    if (!this.initialized) {
      this.eventsCollection = await this.db.getCollection<Events>('events');
      this.rulesCollection = await this.db.getCollection<Rule>('rules');

      // Create indexes for better performance
      try {
        // rules: index for retrieving rules based on event
        await this.rulesCollection.createIndex(
          { eventId: 1 },
          { name: 'eventId_rules', background: true }
        );

        console.log('GamifyLayerRepository indexes created successfully');
      } catch (error) {
        console.error('Error creating indexes in GamifyLayerRepository:', error);
      }

      this.initialized = true;
    }
  }

  async createEvent(
    event: IEvents,
    session?: ClientSession,
  ): Promise<IEvents | null> {
    await this.init();

    const result = await this.eventsCollection.insertOne(event, {session});

    if (result.acknowledged) {
      const createdEvent = await this.eventsCollection.findOne(
        {_id: result.insertedId},
        {session},
      );

      return createdEvent;
    }
  }
  // readEvents(session?: ClientSession): Promise<IEvents[] | null> {
  //   throw new Error('Method not implemented.');
  // }
  async readEvents(session?: ClientSession): Promise<IEvents[] | null> {
    await this.init();

    const events = await this.eventsCollection
      .find({}, { session })
      .toArray();

    return events.length > 0 ? events : null;
}
  async readEvent(
    eventId: ObjectId,
    session?: ClientSession,
  ): Promise<IEvents | null> {
    await this.init();

    const event = await this.eventsCollection.findOne(
      {_id: eventId},
      {session},
    );

    if (!event) {
      return null;
    }
    return event;
  }

  async updateEvent(
    eventId: ObjectId,
    event: Partial<IEvents>,
    session?: ClientSession,
): Promise<UpdateResult | null> {
    await this.init();

    const result = await this.eventsCollection.updateOne(
      { _id: eventId },
      { $set: event },
      { session },
    );

    return result;
}


  async deleteEvent(
    eventId: ObjectId,
    session?: ClientSession,
  ): Promise<DeleteResult | null> {
      await this.init();

      const result = await this.eventsCollection.deleteOne(
        { _id: eventId },
        { session },
      );

      return result;
}

  async createRule(
    rule: IRule,
    session?: ClientSession,
  ): Promise<IRule | null> {
    await this.init();

    const result = await this.rulesCollection.insertOne(rule, {session});

    if (result.acknowledged) {
      const createdRule = await this.rulesCollection.findOne(
        {_id: result.insertedId},
        {session},
      );

      return createdRule;
    }
  }

  async readRules(
    eventId: ObjectId,
    session?: ClientSession,
  ): Promise<IRule[] | null> {
    await this.init();

    const rules = await this.rulesCollection
      .find({eventId}, {session})
      .toArray();

    return rules.length > 0 ? rules : null;
  }

  async readRule(
    ruleId: ObjectId,
    session?: ClientSession,
  ): Promise<IRule | null> {
    await this.init();

    const rule = await this.rulesCollection.findOne({_id: ruleId}, {session});

    return rule;
  }

  async updateRule(
    ruleId: ObjectId,
    rule: IRule,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    await this.init();

    const result = await this.rulesCollection.updateOne(
      {_id: ruleId},
      {$set: rule},
      {session},
    );

    return result;
  }

  async deleteRule(
    ruleId: ObjectId,
    session?: ClientSession,
  ): Promise<DeleteResult | null> {
    await this.init();

    const result = await this.rulesCollection.deleteOne(
      {_id: ruleId},
      {session},
    );

    return result;
  }

  async deleteRulesByEventId(
    eventId: ObjectId,
    session?: ClientSession,
  ): Promise<DeleteResult | null> {
    await this.init();

    const result = await this.rulesCollection.deleteMany(
      { eventId },
      { session },
    );

    return result;
}
}