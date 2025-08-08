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

import {ruleService} from '#gamification/services/index.js';
import {
  Rule,
  RuleBody,
  UpdateRuleBody,
  ReadRuleParams,
  ReadRulesParams,
} from '#gamification/classes/index.js';
import {GAMIFICATION_TYPES} from '../types.js';
import {OpenAPI} from 'routing-controllers-openapi';

@OpenAPI({
  tags: ['Rules'],
})
@injectable()
@JsonController('/gamification', {
  transformResponse: true,
})
export class RuleController {
  constructor(
    @inject(GAMIFICATION_TYPES.RuleService)
    private readonly ruleService: ruleService,
  ) {}

  @Authorized(['admin', 'instructor'])
  @HttpCode(201)
  @Post('/rules')
  async createRule(@Body() rule: RuleBody): Promise<RuleBody> {
    // Transform the rule body to rule instance
    const ruleInstance = new Rule(rule);

    // Call the service to create the rule
    const createdRule = await this.ruleService.createRule(ruleInstance);

    // Return the created rule
    return createdRule;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/rules/event/:eventId')
  async readRules(@Params() params: ReadRulesParams): Promise<Rule[] | null> {
    // Convert string ID to ObjectId
    const rules = await this.ruleService.readRules(params.eventId);
    // Return plain object array if rules exist, otherwise null
    return rules;
  }

  @Authorized(['admin', 'instructor'])
  @Get('/rules/:ruleId')
  async readRule(@Params() params: ReadRuleParams): Promise<Rule> {
    // Convert string ID to ObjectId
    const ruleId = params.ruleId;

    // Call service to get rule
    const rule = await this.ruleService.readRule(ruleId);

    // Return plain object
    return rule;
  }

  @Authorized(['admin', 'instructor'])
  @Put('/rules')
  @HttpCode(200)
  async updateRule(@Body() body: UpdateRuleBody): Promise<{status: boolean}> {
    const {ruleId, ...updateData} = body;

    const updateResult = await this.ruleService.updateRule(ruleId, updateData);

    return {status: updateResult};
  }

  @Authorized(['admin', 'instructor'])
  @HttpCode(204)
  @Delete('/rules/:ruleId')
  //
  async deleteRule(@Params() params: ReadRuleParams): Promise<boolean> {
    const result = await this.ruleService.deleteRule(params.ruleId);
    return result;
  }

  @Authorized(['admin', 'instructor'])
  @HttpCode(204)
  @Delete('/rules/event/:eventId')
  async deleteRulesByEventId(
    @Params() params: ReadRulesParams,
  ): Promise<boolean> {
    const result = await this.ruleService.deleteRulesByEventId(params.eventId);
    if (!result) {
      throw new NotFoundError(`No rules found for event ID ${params.eventId}`);
    }
    return result;
  }
}
