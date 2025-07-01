import 'reflect-metadata';
import {Expose, Transform} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';
import {ID} from '#shared/index.js';
import {IEvents} from '#shared/interfaces/models.js';
import {JSONSchema} from 'class-validator-jsonschema';
import {EventsBody} from '../validators/index.js';

/**
 * Events class - represents an event in the gamification system
 * (e.g., user login, task completion, etc.)
 */

export class Events implements IEvents {
  // Unique database identifier for this event
  @Expose()
  @JSONSchema({
    title: 'Event ID',
    description: 'Unique identifier for the event',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  // Name of the event
  @Expose()
  @JSONSchema({
    title: 'Event Name',
    description: 'Name of the event',
    example: 'User Login',
    type: 'string',
  })
  eventName: string;

  // Description of the event
  @Expose()
  @JSONSchema({
    title: 'Event Description',
    description: 'Description of the event',
    example: 'Triggered when a user logs in',
    type: 'string',
  })
  eventDescription: string;

  // Version of the event schema
  @Expose()
  @JSONSchema({
    title: 'Event Version',
    description: 'Version of the event schema',
    example: '1.0.0',
    type: 'string',
  })
  eventVersion: string;

  @Expose()
  @JSONSchema({
    title: 'Event Payload',
    description: 'Payload of the event containing additional data',
    example: {
      userId: '60d5ec49b3f1c8e4a8f8b8c1',
      timestamp: '2023-10-01T12:00:00Z',
    },
    type: 'object',
  })
  eventPayload: Record<string, any>;

  constructor(body?: EventsBody) {
    if (body) {
      this.eventName = body.eventName;
      this.eventDescription = body.eventDescription;
      this.eventVersion = body.eventVersion;
      this.eventPayload = body.eventPayload || {};
    }
  }
}
