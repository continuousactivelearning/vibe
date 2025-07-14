import 'reflect-metadata';
import {
  IsNotEmpty,
  IsString,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  IsMongoId,
  IsObject,
} from 'class-validator';
import {JSONSchema} from 'class-validator-jsonschema';
import {IEvents, IRule} from '#shared/interfaces/models.js';
import {ObjectId} from 'mongodb';

/**
 * Validator for Events
 */

enum EventPayloadType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

// Custom validator for event payload types

function IsRecordOfEventPayload(
  enumType: object,
  vlidationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRecordOfEventPayload',
      target: object.constructor,
      propertyName,
      constraints: [enumType],
      options: vlidationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const enumValues = Object.values(args.constraints[0]);
          if (
            typeof value !== 'object' ||
            value === null ||
            Array.isArray(value)
          ) {
            return false;
          }
          return Object.values(value).every(v => enumValues.includes(v));
        },
        defaultMessage(args: ValidationArguments) {
          return `${
            args.property
          } must be a record with values of type ${Object.values(
            args.constraints[0],
          ).join(', ')}`;
        },
      },
    });
  };
}

export class EventsBody implements IEvents {
  @JSONSchema({
    title: 'Event Name',
    description: 'Name of the event',
    example: 'User Signup',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  eventName: string;

  @JSONSchema({
    title: 'Event Description',
    description: 'Description of the event',
    example: 'Triggered when a user signs up',
    type: 'string',
  })
  @IsString()
  eventDescription: string;

  @JSONSchema({
    title: 'Event Version',
    description: 'Version of the event schema',
    example: '1.0.0',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  eventVersion: string;

  @JSONSchema({
    title: 'Event Payload',
    description: 'Event payload information with dynamic types',
    type: 'object',
    example: {
      performance: 'int',
      timetaken: 'int',
    },
  })
  @IsRecordOfEventPayload(EventPayloadType)
  eventPayload: Record<string, EventPayloadType>;
}

export class UpdateEventsBody implements IEvents {
  @JSONSchema({
    title: 'Event Name',
    description: 'Name of the event',
    example: 'User Signup',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  eventName: string;

  @JSONSchema({
    title: 'Event Description',
    description: 'Description of the event',
    example: 'Triggered when a user signs up',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  eventDescription: string;

  @JSONSchema({
    title: 'Event Version',
    description: 'Version of the event schema',
    example: '1.0.0',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  eventVersion: string;

  @JSONSchema({
    title: 'Event Payload',
    description: 'Event payload information with dynamic types',
    type: 'object',
    example: {
      performance: 'int',
      timetaken: 'int',
    },
  })
  @IsObject()
  @IsNotEmpty()
  @IsRecordOfEventPayload(EventPayloadType)
  eventPayload: Record<string, EventPayloadType>;
}

export class ReadEventParams {
  @IsString()
  eventId: string;
}

export class RuleBody implements IRule {
  @JSONSchema({
    title: 'Rule Name',
    description: 'Name of the rule',
    example: 'Quick Learner Rule',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  ruleName: string;
  @JSONSchema({
    title: 'Rule Description',
    description: 'Description of the rule',
    example:
      'Quick Learner Rule awarded for completing a quiz in under 5 minutes',
    type: 'string',
  })
  @IsString()
  ruleDescription: string;
  @JSONSchema({
    title: 'Rule Description',
    description: 'Description of the rule',
    example:
      'Quick Learner Rule awarded for completing a quiz in under 5 minutes',
    type: 'string',
  })
  @IsMongoId()
  eventId: string | ObjectId;
  @JSONSchema({
    title: 'Metric ID',
    description: 'ID of the metric associated with this rule',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsMongoId()
  metricId: string | ObjectId;

  @JSONSchema({
    title: 'Rule Logic',
    description: 'Logic for the rule to be applied',
    type: 'object',
  })
  logic: Record<string, any>;

  @JSONSchema({
    title: 'Rule Version',
    description: 'Version of the rule schema',
    example: 1,
    type: 'number',
  })
  ruleVersion: number;
}
export class ReadRulesParams {
  @JSONSchema({
    title: 'Event ID',
    description: 'ID of the event to find rules for',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsMongoId()
  eventId: string;
}

export class ReadRuleParams {
  @JSONSchema({
    title: 'Rule ID',
    description: 'ID of the rule to retrieve',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @IsMongoId()
  ruleId: string;
}

export class UpdateRuleParams {
  @JSONSchema({
    title: 'Rule ID',
    description: 'ID of the rule to update',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @IsMongoId()
  ruleId: string;
}

export class UpdateRuleBody implements IRule {
  @JSONSchema({
    title: 'Rule ID',
    description: 'ID of the rule to update',
    example: '60d5ec49b3f1c8e4a8f8b8c2',
    type: 'string',
  })
  @IsMongoId()
  ruleId: string;

  @JSONSchema({
    title: 'Rule Name',
    description: 'Name of the rule',
    example: 'Quick Learner Rule',
    type: 'string',
  })
  @IsString()
  ruleName: string;

  @JSONSchema({
    title: 'Rule Description',
    description: 'Description of the rule',
    example:
      'Quick Learner Rule awarded for completing a quiz in under 5 minutes',
    type: 'string',
  })
  @IsString()
  ruleDescription: string;

  @JSONSchema({
    title: 'Event ID',
    description: 'ID of the event this rule is associated with',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsMongoId()
  eventId: string | ObjectId;

  @JSONSchema({
    title: 'Metric ID',
    description: 'ID of the metric associated with this rule',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsMongoId()
  metricId: string | ObjectId;

  @JSONSchema({
    title: 'Rule Logic',
    description: 'Logic for the rule to be applied',
    type: 'object',
  })
  logic: Record<string, any>;

  @JSONSchema({
    title: 'Rule Version',
    description: 'Version of the rule schema',
    example: 1,
    type: 'number',
  })
  ruleVersion: number;
}

export class EventTriggerBody {
  @JSONSchema({
    title: 'User ID',
    description: 'ID of the user triggering the event',
    example: '60d5ec49b3f1c8e4a8f8b8c3',
    type: 'string',
  })
  @IsMongoId()
  userId: string;

  @JSONSchema({
    title: 'Event ID',
    description: 'ID of the event to trigger',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsMongoId()
  eventId: string ;

  @JSONSchema({
    title: 'Event Payload',
    description: 'Payload data for the event',
    type: 'object',
    example: {
      performance: 95,
      timetaken: 300,
    },
  })
  @IsObject()
  eventPayload: Record<string, any>;
}


