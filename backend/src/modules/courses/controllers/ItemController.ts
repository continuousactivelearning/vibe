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
  HttpError,
  BadRequestError,
} from 'routing-controllers';
import {Service, Inject} from 'typedi';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {ItemRepository} from 'shared/database/providers/mongo/repositories/ItemRepository';
import {ItemsGroup, Item} from '../classes/transformers/Item';
import {DeleteError} from 'shared/errors/errors';
import {ItemService} from '../services/ItemService';
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
} from '../classes/validators/ItemValidators';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {BadRequestErrorResponse} from 'shared/middleware/errorHandler';
import {
  ItemDataResponse,
  ItemNotFoundErrorResponse,
} from '../classes/validators/ItemValidators';

@OpenAPI({
  tags: ['Items'],
})
@JsonController('/courses')
@Service()
export class ItemController {
  constructor(
    @Inject('CourseRepo') private readonly courseRepo: CourseRepository,
    @Inject('ItemRepo') private readonly itemRepo: ItemRepository,
    @Inject('ItemService') private readonly itemService: ItemService,
  ) {
    if (!this.courseRepo) {
      throw new Error('CourseRepository is not properly injected');
    }
  }

  /**
   * Create a new item under a specific section of a module in a course version.
   *
   * @param params - Route parameters including versionId, moduleId, and sectionId.
   * @param body - The item data to be created.
   * @returns The updated itemsGroup and version.
   *
   * @throws HTTPError(500) on internal errors.
   *
   * @category Courses/Controllers
   */

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

  /**
   * Retrieve all items from a section of a module in a course version.
   *
   * @param params - Route parameters including versionId, moduleId, and sectionId.
   * @returns The list of items within the section.
   *
   * @throws HTTPError(500) on internal errors.
   *
   * @category Courses/Controllers
   */

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
    try {
      const {versionId, moduleId, sectionId} = params;
      //Fetch Version
      const version = await this.courseRepo.readVersion(versionId);

      //Find Module
      const module = version.modules.find(m => m.moduleId === moduleId);

      //Find Section
      const section = module.sections.find(s => s.sectionId === sectionId);

      //Fetch Items
      const itemsGroup = await this.itemRepo.readItemsGroup(
        section.itemsGroupId.toString(),
      );

      return {
        itemsGroup: itemsGroup,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpError(500, error.message);
      }
    }
    const {versionId, moduleId, sectionId} = params;
    return await this.itemService.readAllItems(versionId, moduleId, sectionId);
  }

  /**
   * Update an existing item in a section of a module in a course version.
   *
   * @param params - Route parameters including versionId, moduleId, sectionId, and itemId.
   * @param body - Fields to update, including name, description, type, and itemDetails.
   * @returns The updated itemsGroup and version.
   *
   * @throws HTTPError(500) on internal errors.
   *
   * @category Courses/Controllers
   */

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

  /**
   * Delete an item from a section of a module in a course version.
   * @param params - Route parameters including versionId, moduleId, sectionId, and itemId.
   * @return The updated itemsGroup and version.
   * @throw HTTPError(500) on internal errors.
   * @category Courses/Controllers
   */

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
    try {
      const {itemsGroupId, itemId} = params;

      if (!itemsGroupId || !itemId) {
        throw new DeleteError('Missing required parameters');
      }

      //Fetch ItemsGroup
      const itemsGroup = await this.itemRepo.readItemsGroup(itemsGroupId);
      if (!itemsGroup) {
        throw new DeleteError('ItemsGroup not found');
      }

      const itemToDelete = itemsGroup.items.find(
        i => i.itemId.toString() === itemId,
      );

      if (!itemToDelete) {
        throw new DeleteError('Item not found');
      }

      const deletionStatus = await this.itemRepo.deleteItem(
        itemsGroupId,
        itemId,
      );

      if (!deletionStatus) {
        throw new Error('Unable to delete item');
      }

      const updatedItemsGroup =
        await this.itemRepo.readItemsGroup(itemsGroupId);

      return {
        deletedItem: instanceToPlain(itemToDelete),
        updatedItemsGroup: instanceToPlain(updatedItemsGroup),
      };
    } catch (error) {
      if (error.message === 'Item not found') {
        throw new HttpError(404, error.message);
      }
      if (error.message === 'Missing required parameters') {
        throw new BadRequestError(error.message);
      }
      if (error instanceof Error) {
        throw new HttpError(500, error.message);
      }
    }
    const {itemsGroupId, itemId} = params;
    return await this.itemService.deleteItem(itemsGroupId, itemId);
  }

  /**
   * Move an item to a new position within a section by recalculating its order.
   *
   * @param params - Route parameters including versionId, moduleId, sectionId, and itemId.
   * @param body - Movement instructions including `afterItemId` or `beforeItemId`.
   * @returns The updated itemsGroup and version.
   *
   * @throws BadRequestError if both afterItemId and beforeItemId are missing.
   * @throws HTTPError(500) on internal errors.
   *
   * @category Courses/Controllers
   */
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
}
