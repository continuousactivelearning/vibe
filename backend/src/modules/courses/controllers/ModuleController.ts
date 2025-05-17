import 'reflect-metadata';
import {
  Authorized,
  JsonController,
  Params,
  Body,
  Post,
  Put,
  Delete,
  HttpCode,
} from 'routing-controllers';
import {Service, Inject} from 'typedi';
import {instanceToPlain} from 'class-transformer';
import {ModuleService} from '../services/ModuleService';
import {
  CreateModuleParams,
  CreateModuleBody,
  UpdateModuleParams,
  UpdateModuleBody,
  MoveModuleParams,
  MoveModuleBody,
  DeleteModuleParams,
} from '../classes/validators/ModuleValidators';

@JsonController('/courses')
@Service()
export class ModuleController {
  constructor(
    @Inject(() => ModuleService)
    private service: ModuleService,
  ) {}

  @Authorized(['admin'])
  @Post('/versions/:versionId/modules')
  @HttpCode(201)
  async create(
    @Params() params: CreateModuleParams,
    @Body() body: CreateModuleBody,
  ) {
    const updated = await this.service.createModule(params.versionId, body);
    return {version: instanceToPlain(updated)};
  }

  @Authorized(['admin'])
  @Put('/versions/:versionId/modules/:moduleId')
  async update(
    @Params() params: UpdateModuleParams,
    @Body() body: UpdateModuleBody,
  ) {
    const updated = await this.service.updateModule(
      params.versionId,
      params.moduleId,
      body,
    );
    return {version: instanceToPlain(updated)};
  }

  @Authorized(['admin'])
  @Put('/versions/:versionId/modules/:moduleId/move')
  async move(@Params() params: MoveModuleParams, @Body() body: MoveModuleBody) {
    const updated = await this.service.moveModule(
      params.versionId,
      params.moduleId,
      body,
    );
    return {version: instanceToPlain(updated)};
  }

  @Authorized(['admin'])
  @Delete('/versions/:versionId/modules/:moduleId')
  async delete(@Params() params: DeleteModuleParams) {
    await this.service.deleteModule(params.versionId, params.moduleId);
    return {
      message: `Module ${params.moduleId} deleted in version ${params.versionId}`,
    };
  }
}
