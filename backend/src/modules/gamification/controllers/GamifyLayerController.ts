import {injectable, inject} from 'inversify';
import {
  JsonController,
  Post,
  Get,
  Body,
  Put,
  Params,
  Delete,
  Authorized,
  HttpCode,
} from 'routing-controllers';
import { NotFoundError } from 'routing-controllers';

import {EventService, RuleService} from '#gamification/services/index.js';
import {
  Events,
  EventsBody,
  ReadEventParams,
  Rule,
  RuleBody,
  UpdateRuleBody,
  ReadRuleParams,
  ReadRulesParams,
  EventTriggerBody,
  MetricTriggerResponse,
} from '#gamification/classes/index.js';
import {GAMIFICATION_TYPES} from '../types.js';
import {instanceToPlain} from 'class-transformer';
import {EventTrigger} from '../classes/transformers/EventTrigger.js';
import {ClientSession} from 'mongodb';

@injectable()
@JsonController('/gamification')
export class GamifyLayerController {
  constructor(
    @inject(GAMIFICATION_TYPES.EventService)
    private readonly eventService: EventService,

    @inject(GAMIFICATION_TYPES.RuleService)
    private readonly ruleService: RuleService,
  ) {}

  @Authorized(['admin', 'instructor'])
  @HttpCode(201)
  @Post('/events')
  async createEvent(@Body() event: EventsBody): Promise<Events> {
    // Transform the event body to an instance of Events
    const eventInstance = new Events(event);

    const createdEvent = await this.eventService.createEvent(eventInstance);

    // Return the created event
    return instanceToPlain(createdEvent) as Events;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/events')
  async readEvents(): Promise<Events[]> {
    const events = await this.eventService.readEvents();
    if (!events || events.length === 0) {
      throw new NotFoundError('No events found');
    }
    return events.map(event => instanceToPlain(event) as Events);
  }



  @Authorized(['admin', 'instructor'])
  @Get('/events/:eventId')
  async readEvent(@Params() params: ReadEventParams): Promise<Events> {
    const event = await this.eventService.readEvent(params.eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${params.eventId} not found`);
    }
    return instanceToPlain(event) as Events;
  }

  @Authorized(['admin', 'instructor'])
  @Put('/events/:eventId')
  async updateEvent(
    @Params() params: ReadEventParams,
    @Body() body: EventsBody
  ): Promise<{ status: boolean }> {
    const eventInstance = new Events(body);
    const status = await this.eventService.updateEvent(
      params.eventId,
      eventInstance 
    );
    
    return { status };
}

  @Authorized(['admin', 'instructor'])
  @HttpCode(204)
  @Delete('/events/:eventId')
  async deleteEvent(@Params() params: ReadEventParams): Promise<boolean> {
    const result = await this.eventService.deleteEvent(params.eventId);
    if (!result) {
      throw new NotFoundError(`Event with ID ${params.eventId} not found`);
    }
    return result;
  }


  @Authorized(['admin', 'instructor'])
  @HttpCode(201)
  @Post('/rules')
  async createRule(@Body() rule: RuleBody): Promise<RuleBody> {
    // Transform the rule body to rule instance
    const ruleInstance = new Rule(rule);

    // Call the service to create the rule
    const createdRule = await this.ruleService.createRule(ruleInstance);

    // Return the created rule
    return instanceToPlain(createdRule) as RuleBody;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/rules/:eventId')
  async readRules(@Params() params: ReadRulesParams): Promise<Rule[] | null> {
    // Convert string ID to ObjectId
    const rules = await this.ruleService.readRules(params.eventId);
    if (!rules || rules.length === 0) {
      throw new NotFoundError('No rules found for this event');
  }

    // Return plain object array if rules exist, otherwise null
    return rules ? rules.map(rule => instanceToPlain(rule) as Rule) : null;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/rule/:ruleId')
  async readRule(@Params() params: ReadRuleParams): Promise<Rule> {
    // Convert string ID to ObjectId
    const ruleId = params.ruleId;

    // Call service to get rule
    const rule = await this.ruleService.readRule(ruleId);

    // Return plain object
    return instanceToPlain(rule) as Rule;
  }

  @Authorized(['admin', 'instructor'])
  @Put('/rule')
  @HttpCode(200)
  async updateRule(@Body() body: UpdateRuleBody): Promise<{status: boolean}> {
    const {ruleId, ...updateData} = body;

    const updateResult = await this.ruleService.updateRule(ruleId, updateData);

    return {status: updateResult};
  }

  @Authorized(['admin', 'instructor'])
  @HttpCode(204)
  @Delete('/rule/:ruleId')
  //
  async deleteRule(@Params() params: ReadRuleParams): Promise<boolean> {
    const result = await this.ruleService.deleteRule(params.ruleId);
    return result;
  }

  @Authorized(['admin', 'instructor', 'user'])
  @HttpCode(200)
  @Post('/eventtrigger')
  async triggerEvent(
    @Body() body: EventTriggerBody,
  ): Promise<MetricTriggerResponse> {
    // Transform the body to an instance of EventTrigger

    const eventTrigger = new EventTrigger(body);

    // Call the service to trigger the event

    const response = await this.eventService.eventTrigger(eventTrigger);

    // Return the response from the service
    return instanceToPlain(response) as MetricTriggerResponse;
  }

  @Authorized(['admin', 'instructor'])
  @HttpCode(204)
  @Delete('/rules/:eventId')
  async deleteRulesByEventId(@Params() params: ReadRulesParams): Promise<boolean> {
    const result = await this.ruleService.deleteRulesByEventId(params.eventId);
    if (!result) {
      throw new NotFoundError(`No rules found for event ID ${params.eventId}`);
    }
    return result;
} 
}
