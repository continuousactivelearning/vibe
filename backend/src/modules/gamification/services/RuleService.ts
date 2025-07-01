import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {
  BaseService,
  MongoDatabase,
  IGamifyLayerRepository,
} from '#root/shared/index.js';
import {GLOBAL_TYPES} from '#root/types.js';
import {Rule} from '#gamification/classes/index.js';
import {plainToInstance} from 'class-transformer';
import {NotFoundError} from 'routing-controllers';
import jsonLogic from 'json-logic-js';
import {ObjectId} from 'mongodb';

/**
 * RuleService - handles business logic for gamification rules
 * Manages CRUD operations for rules that define game mechanics
 */

@injectable()
export class RuleService extends BaseService {
  constructor(
    @inject(GLOBAL_TYPES.Database)
    private readonly mongoDatabase: MongoDatabase,
    @inject(GLOBAL_TYPES.GamifyLayerRepo)
    private readonly gamifyLayerRepo: IGamifyLayerRepository,
  ) {
    super(mongoDatabase);
  }

  createRule(rule: Rule): Promise<Rule> {
    return this._withTransaction(async session => {
      // Transform the Rule instance
      rule = plainToInstance(Rule, rule);

      // Validate the rule with the event payload.

      const event = await this.gamifyLayerRepo.readEvent(rule.eventId, session);

      // If the event does not exist, throw an error

      if (!event) {
        throw new NotFoundError(`Event with ID ${rule.eventId} not found`);
      }

      // Now create a dummy payload to validate the rule

      const dummyPayload = {};

      for (const key in event.eventPayload) {
        const value = event.eventPayload[key];

        switch (value) {
          case 'string':
            dummyPayload[key] = 'dummy string';
            break;
          case 'number':
            dummyPayload[key] = 0;
            break;
          case 'boolean':
            dummyPayload[key] = false;
            break;
          case 'array':
            dummyPayload[key] = [];
            break;
          case 'object':
            dummyPayload[key] = {};
            break;
        }
      }

      // Validate the rule with the dummy payload

      try {
        const validRule = jsonLogic.apply(rule.logic, dummyPayload);
      } catch (error) {
        throw new Error(`Invalid rule logic: ${error.message}`);
      }

      // Create the rule in the repository

      const createdRule = await this.gamifyLayerRepo.createRule(rule, session);

      if (!createdRule) {
        throw new Error('Failed to create rule');
      }

      return plainToInstance(Rule, createdRule) as Rule;
    });
  }

  async readRules(id: string): Promise<Rule[] | null> {
    return this._withTransaction(async session => {
      const eventId = new ObjectId(id);
      const rules = await this.gamifyLayerRepo.readRules(eventId, session);

      return rules ? rules.map(rule => plainToInstance(Rule, rule)) : null;
    });
  }

  async readRule(id: string): Promise<Rule> {
    return this._withTransaction(async session => {
      const ruleId = new ObjectId(id);
      const rule = await this.gamifyLayerRepo.readRule(ruleId, session);

      if (!rule) {
        throw new NotFoundError(`Rule with ID ${ruleId} not found`);
      }
      return plainToInstance(Rule, rule);
    });
  }

  async updateRule(id: string, rule: Partial<Rule>): Promise<boolean> {
    return this._withTransaction(async session => {
      const ruleId = new ObjectId(id); // Convert string to ObjectId here
      const updateResult = await this.gamifyLayerRepo.updateRule(
        ruleId,
        rule,
        session,
      );

      if (!updateResult || updateResult.matchedCount === 0) {
        throw new NotFoundError(`Rule with ID ${ruleId} not found for update`);
      }

      return updateResult.modifiedCount > 0;
    });
  }

  async deleteRule(id: string): Promise<boolean> {
    return this._withTransaction(async session => {
      const ruleId = new ObjectId(id);
      const deleteResult = await this.gamifyLayerRepo.deleteRule(
        ruleId,
        session,
      );

      if (!deleteResult || deleteResult.deletedCount === 0) {
        throw new NotFoundError(
          `Rule with ID ${ruleId} not found for deletion`,
        );
      }
      return true;
    });
  }
}
