import {injectable, inject} from 'inversify';
import {NotFoundError, InternalServerError} from 'routing-controllers';
import {
  BaseService,
  MongoDatabase,
  IGamifyLayerRepository,
} from '#root/shared/index.js';
import {GLOBAL_TYPES} from '#root/types.js';
import {Events, MetricTriggerResponse} from '#gamification/classes/index.js';
import {plainToInstance} from 'class-transformer';
import {ObjectId} from 'mongodb';
import jsonLogic from 'json-logic-js';
import {GAMIFICATION_TYPES} from '../types.js';
import {MetricTriggerService} from './MetricTriggerService.js';
import {EventTrigger} from '../classes/transformers/EventTrigger.js';

@injectable()
export class EventService extends BaseService {
  constructor(
    @inject(GLOBAL_TYPES.Database)
    private readonly mongodatabase: MongoDatabase,
    @inject(GLOBAL_TYPES.GamifyLayerRepo)
    private readonly gamifyLayerRepo: IGamifyLayerRepository,
    @inject(GAMIFICATION_TYPES.MetricTriggerService)
    private readonly metricTriggerService: MetricTriggerService,
  ) {
    super(mongodatabase);
  }

  createEvent(event: Events): Promise<Events> {
    return this._withTransaction(async session => {
      // transform the event to instance.
      event = plainToInstance(Events, event);

      const createdEvent = await this.gamifyLayerRepo.createEvent(
        event,
        session,
      );
      if (!createdEvent) {
        throw new InternalServerError('Failed to create event');
      }

      return plainToInstance(Events, createdEvent);
    });
  }

  eventTrigger(trigger: EventTrigger): Promise<MetricTriggerResponse> {
    // This method triggers an event for a user with the given payload.

    trigger = plainToInstance(EventTrigger, trigger);

    // Convert string IDs to ObjectId
    const userId = trigger.userId;
    const eventId = trigger.eventId;
    const eventPayload = trigger.eventPayload;

    return this._withTransaction(async session => {
      // Validate the event and eventPayload

      const event = await this.gamifyLayerRepo.readEvent(eventId, session);

      if (!event) {
        throw new NotFoundError(`Event with ID ${eventId} not found`);
      }

      const eventKeys = Object.keys(event.eventPayload || {});
      const payloadKeys = Object.keys(eventPayload || {});

      const eventValues = Object.values(event.eventPayload || {});
      const payloadValues = Object.values(eventPayload || {});

      const isKeysValid = payloadKeys.every(key => eventKeys.includes(key));

      const isValueValid = payloadValues.every(value =>
        eventValues.includes(typeof value),
      );

      if (!isKeysValid || !isValueValid) {
        throw new Error(
          `Invalid event payload for event ID ${eventId}. Expected keys: ${eventKeys.join(
            ', ',
          )}, received: ${payloadKeys.join(', ')}`,
        );
      }

      // Fetch the all rules for the event.

      const rules = await this.gamifyLayerRepo.readRules(eventId, session);

      if (!rules) {
        throw new NotFoundError(`No rules found for event ID ${eventId}`);
      }

      // Evaluate the rules-logic with the event payload.

      const metricTriggers = rules.map(rule => {
        const ruleLogic = rule.logic;
        const isRuleValid = jsonLogic.apply(ruleLogic, eventPayload);
        if (isRuleValid) {
          return {
            metricId: rule.metricId,
          };
        }
      });

      const metricTrigger = {
        userId: userId,
        metrics: metricTriggers.filter(metric => metric !== undefined),
      };

      if (metricTrigger.metrics.length === 0) {
        return new MetricTriggerResponse({
          metricsUpdated: [],
          achievementsUnlocked: [],
        });
      }

      // Request the gamify engine to trigger the metrics for the user.

      const triggerResponse = await this.metricTriggerService.metricTrigger(
        metricTrigger,
      );

      return triggerResponse;
    });
  }
}
