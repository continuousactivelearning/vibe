import {injectable, inject} from 'inversify';
import {
  JsonController,
  Post,
  Body,
  Authorized,
  HttpCode,
} from 'routing-controllers';

import {
  eventService,
  metricTriggerService,
} from '#gamification/services/index.js';
import {
  EventTriggerBody,
  MetricTriggerValidator,
  MetricTrigger,
  MetricTriggerResponse,
} from '#gamification/classes/index.js';
import {GAMIFICATION_TYPES} from '../types.js';
import {EventTrigger} from '../classes/transformers/EventTrigger.js';
import {OpenAPI} from 'routing-controllers-openapi';

@OpenAPI({
  tags: ['Triggers'],
})
@injectable()
@JsonController('/gamification/trigger', {
  transformResponse: true,
})
export class TriggerController {
  constructor(
    @inject(GAMIFICATION_TYPES.EventService)
    private readonly eventService: eventService,

    @inject(GAMIFICATION_TYPES.MetricTriggerService)
    private readonly MetricTriggerService: metricTriggerService,
  ) {}

  @Authorized(['admin', 'instructor', 'user'])
  @HttpCode(200)
  @Post('/event/')
  async triggerEvent(
    @Body() body: EventTriggerBody,
  ): Promise<MetricTriggerResponse> {
    // Transform the body to an instance of EventTrigger

    const eventTrigger = new EventTrigger(body);

    // Call the service to trigger the event

    const response = await this.eventService.eventTrigger(eventTrigger);

    // Return the response from the service
    return response;
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Post('/metric')
  @HttpCode(200)
  async MetricTriggers(
    @Body() body: MetricTriggerValidator,
  ): Promise<MetricTriggerResponse> {
    const metricTrigger = new MetricTrigger(body);
    const metricTriggerResult = await this.MetricTriggerService.metricTrigger(
      metricTrigger,
    );

    return metricTriggerResult;
  }
}
