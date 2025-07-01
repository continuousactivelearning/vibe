import 'reflect-metadata';
import {Expose, Transform} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';

import {ID, IRule} from '#shared/index.js';
import {RuleBody} from '../validators/GamifyLayerValidators.js';
import {JSONSchema} from 'class-validator-jsonschema';

export class Rule implements IRule {
  @JSONSchema({
    title: 'Rule ID',
    description: 'Unique identifier for the rule',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  @JSONSchema({
    title: 'Rule Name',
    description: 'Name of the rule',
    example: 'Quick Learner Rule',
    type: 'string',
  })
  @Expose()
  ruleName: string;

  @JSONSchema({
    title: 'Rule Description',
    description: 'Description of the rule',
    example:
      'Quick Learner Rule awarded for completing a quiz in under 5 minutes',
    type: 'string',
  })
  @Expose()
  ruleDescription: string;

  @JSONSchema({
    title: 'Event ID',
    description: 'ID of the event associated with this rule',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Expose()
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  eventId: string | ID;

  @JSONSchema({
    title: 'Metric ID',
    description: 'ID of the metric associated with this rule',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Expose()
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  metricId: string | ID;

  @JSONSchema({
    title: 'Rule Logic',
    description: 'Logic for the rule to be applied',
    type: 'object',
  })
  @Expose()
  logic: Record<string, any>;

  @JSONSchema({
    title: 'Rule Version',
    description: 'Version of the rule schema',
    example: 1,
    type: 'number',
  })
  @Expose()
  ruleVersion: number;

  constructor(body?: RuleBody) {
    if (body) {
      this.ruleName = body.ruleName;
      this.ruleDescription = body.ruleDescription;
      this.eventId = body.eventId;
      this.metricId = body.metricId;
      this.logic = body.logic || {};
      this.ruleVersion = body.ruleVersion || 1;
    }
  }
}
