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
  NotFoundError,
} from 'routing-controllers';

import {eventService} from '#gamification/services/index.js';
import {
  Events,
  EventsBody,
  ReadEventParams,
} from '#gamification/classes/index.js';
import {GAMIFICATION_TYPES} from '../types.js';
import {OpenAPI} from 'routing-controllers-openapi';

@OpenAPI({
  tags: ['Events'],
})
@injectable()
@JsonController('/gamification', {
  transformResponse: true,
})
export class EventController {
  constructor(
    @inject(GAMIFICATION_TYPES.EventService)
    private readonly eventService: eventService,
  ) {}

  @Authorized(['admin', 'instructor'])
  @HttpCode(201)
  @Post('/events')
  async createEvent(@Body() event: EventsBody): Promise<Events> {
    // Transform the event body to an instance of Events
    const eventInstance = new Events(event);

    const createdEvent = await this.eventService.createEvent(eventInstance);

    // Return the created event
    return createdEvent;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/events')
  async readEvents(): Promise<Events[]> {
    const events = await this.eventService.readEvents();
    if (!events || events.length === 0) {
      throw new NotFoundError('No events found');
    }
    return events;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/events/:eventId')
  async readEvent(@Params() params: ReadEventParams): Promise<Events> {
    const event = await this.eventService.readEvent(params.eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${params.eventId} not found`);
    }
    return event;
  }

  @Authorized(['admin', 'instructor'])
  @Put('/events/:eventId')
  async updateEvent(
    @Params() params: ReadEventParams,
    @Body() body: EventsBody,
  ): Promise<{status: boolean}> {
    const eventInstance = new Events(body);
    const status = await this.eventService.updateEvent(
      params.eventId,
      eventInstance,
    );

    return {status};
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
}
