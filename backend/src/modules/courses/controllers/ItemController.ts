import 'reflect-metadata';
import {
  JsonController,
  Authorized,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Params,
  HttpCode,
  CurrentUser,
  ForbiddenError,
} from 'routing-controllers';
import {Service, Inject} from 'typedi';
import {
  CreateItemBody,
  UpdateItemBody,
  MoveItemBody,
  CreateItemParams,
  ReadAllItemsParams,
  UpdateItemParams,
  MoveItemParams,
  DeleteItemParams,
  DeletedItemResponse,
  GetItemParams,
} from '../classes/validators/ItemValidators';
import {ItemService} from '../services';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {BadRequestErrorResponse} from '../../../shared/middleware/errorHandler';
import {
  ItemDataResponse,
  ItemNotFoundErrorResponse,
} from '../classes/validators/ItemValidators';
import {IUser} from 'shared/interfaces/Models';
import {ProgressService} from 'modules/users/services/ProgressService';

@OpenAPI({
  tags: ['Items'],
})
@JsonController('/courses')
@Service()
export class ItemController {
  constructor(
    @Inject('ItemService') private readonly itemService: ItemService,
    @Inject('ProgressService')
    private readonly progressService: ProgressService,
  ) {}

  @Authorized(['admin'])
  @Post('/versions/:versionId/modules/:moduleId/sections/:sectionId/items')
  @HttpCode(201)
  @OpenAPI({
    summary: 'Create Item',
    description: 'Creates a new item within a section.',
  })
  @ResponseSchema(ItemDataResponse, {
    description: 'Item created successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(ItemNotFoundErrorResponse, {
    description: 'Item not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'Create Item',
    description:
      'Creates a new item in the specified section with the provided details.',
  })
  async create(
    @Params() params: CreateItemParams,
    @Body() body: CreateItemBody,
  ) {
    const {versionId, moduleId, sectionId} = params;
    return await this.itemService.createItem(
      versionId,
      moduleId,
      sectionId,
      body,
    );
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Get('/versions/:versionId/modules/:moduleId/sections/:sectionId/items')
  @ResponseSchema(ItemDataResponse, {
    description: 'Items retrieved successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(ItemNotFoundErrorResponse, {
    description: 'Item not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'Get All Items',
    description:
      'Retrieves all items from the specified section of a module in a course version.',
  })
  async readAll(@Params() params: ReadAllItemsParams) {
    const {versionId, moduleId, sectionId} = params;
    return await this.itemService.readAllItems(versionId, moduleId, sectionId);
  }

  @Authorized(['admin'])
  @Put(
    '/versions/:versionId/modules/:moduleId/sections/:sectionId/items/:itemId',
  )
  @ResponseSchema(ItemDataResponse, {
    description: 'Item updated successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(ItemNotFoundErrorResponse, {
    description: 'Item not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'Update Item',
    description:
      'Updates an existing item in the specified section with the provided details.',
  })
  async update(
    @Params() params: UpdateItemParams,
    @Body() body: UpdateItemBody,
  ) {
    const {versionId, moduleId, sectionId, itemId} = params;
    return await this.itemService.updateItem(
      versionId,
      moduleId,
      sectionId,
      itemId,
      body,
    );
  }

  @Authorized(['instructor', 'admin'])
  @Delete('/itemGroups/:itemsGroupId/items/:itemId')
  @ResponseSchema(DeletedItemResponse, {
    description: 'Item deleted successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(ItemNotFoundErrorResponse, {
    description: 'Item not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'Delete Item',
    description: 'Deletes an item from a course section permanently.',
  })
  async delete(@Params() params: DeleteItemParams) {
    const {itemsGroupId, itemId} = params;
    return await this.itemService.deleteItem(itemsGroupId, itemId);
  }

  @Authorized(['admin'])
  @Put(
    '/versions/:versionId/modules/:moduleId/sections/:sectionId/items/:itemId/move',
  )
  @ResponseSchema(ItemDataResponse, {
    description: 'Item moved successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(ItemNotFoundErrorResponse, {
    description: 'Item not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'Move Item',
    description:
      'Moves an item to a new position within its section by recalculating its order.',
  })
  async move(@Params() params: MoveItemParams, @Body() body: MoveItemBody) {
    const {versionId, moduleId, sectionId, itemId} = params;
    return await this.itemService.moveItem(
      versionId,
      moduleId,
      sectionId,
      itemId,
      body,
    );
  }

  @Authorized(['admin', 'instructor', 'student'])
  @Get('/:courseId/versions/:versionId/item/:itemId')
  @HttpCode(201)
  @OpenAPI({
    summary: 'Read Item',
    description: 'Read the current item based on progress of user.',
  })
  @ResponseSchema(ItemDataResponse, {
    description: 'Item retrieved successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(ItemNotFoundErrorResponse, {
    description: 'Item not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'Create Item',
    description:
      'Creates a new item in the specified section with the provided details.',
  })
  async getItem(@CurrentUser() user: IUser, @Params() params: GetItemParams) {
    const {courseId, courseVersionId, itemId} = params;
    const progress = await this.progressService.getUserProgress(
      user.id,
      courseId,
      courseVersionId,
    );
    if (progress.currentItem !== itemId) {
      throw new ForbiddenError('Item does not match current progress');
    }
    return await this.itemService.readItem(courseVersionId, itemId);
  }
}
