import {IEvents, IRule} from '#root/shared/interfaces/models.js';
import {ClientSession, UpdateResult, DeleteResult, ObjectId} from 'mongodb';

export interface IGamifyLayerRepository {
  createEvent(event: IEvents, session?: ClientSession): Promise<IEvents | null>;
  readEvents(session?: ClientSession): Promise<IEvents[] | null>;
  readEvent(
    eventId: ObjectId | string,
    session?: ClientSession,
  ): Promise<IEvents | null>;
  updateEvent(
    eventId: ObjectId | string,
    event: Partial<IEvents>,
    session?: ClientSession,
  ): Promise<UpdateResult | null>;
  deleteEvent(
    evenetId: ObjectId | string,
    session?: ClientSession,
  ): Promise<DeleteResult | null>;

  createRule(rule: IRule, session?: ClientSession): Promise<IRule | null>;
  readRules(
    eventId: ObjectId | string,
    session?: ClientSession,
  ): Promise<IRule[] | null>;
  readRule(ruleId: ObjectId, session?: ClientSession): Promise<IRule | null>;

  updateRule(
    ruleId: ObjectId | string,
    rule: Partial<IRule>,
    session?: ClientSession,
  ): Promise<UpdateResult | null>;

  deleteRule(
    ruleId: ObjectId | string,
    session?: ClientSession,
  ): Promise<DeleteResult | null>;
  deleteRulesByEventId(
    eventId: ObjectId,
    session?: ClientSession,
  ): Promise<DeleteResult | null>;
}
