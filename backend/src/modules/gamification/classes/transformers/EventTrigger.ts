import 'reflect-metadata';
import {Expose, Transform} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';
import {ObjectId} from 'mongodb';
import {EventTriggerBody} from '../validators/GamifyLayerValidators.js';

export class EventTrigger {
  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  userId: string | ObjectId;

  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  eventId: string | ObjectId;

  @Expose()
  eventPayload: Record<string, any>;

  constructor(body?: EventTriggerBody) {
    if (body) {
      this.userId = body.userId;
      this.eventId = body.eventId;
      this.eventPayload = body.eventPayload;
    }
  }
}
