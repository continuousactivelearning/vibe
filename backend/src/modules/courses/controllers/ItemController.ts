import {instanceToPlain, plainToInstance} from 'class-transformer';
import 'reflect-metadata';
import {
  Authorized,
  BadRequestError,
  Body,
  Get,
  JsonController,
  Params,
  Post,
  Put,
  Delete,
  HttpError,
  HttpCode,
} from 'routing-controllers';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {UpdateError} from 'shared/errors/errors';
import {DeleteError} from 'shared/errors/errors';
import {Inject, Service} from 'typedi';
import {Item, ItemsGroup} from '../classes/transformers/Item';
import {
  CreateItemBody,
  UpdateItemBody,
  MoveItemBody,
  CreateItemParams,
  ReadAllItemsParams,
  UpdateItemParams,
  MoveItemParams,
  DeleteItemParams,
} from '../classes/validators/ItemValidators';
import {calculateNewOrder} from '../utils/calculateNewOrder';

/**
 * Controller for managing items within course modules and sections.
 * Handles operations such as creation, retrieval, update, and reordering.
 *
 * @category Courses/Controllers
 * @categoryDescription
 * Provides endpoints for working with "items" inside sections of modules
 * within course versions. This includes content like videos, blogs, or quizzes.
 */

@JsonController('/courses')
@Service()
export class ItemController {
  constructor(
    @Inject('CourseRepo') private readonly courseRepo: CourseRepository,
  ) {
    if (!this.courseRepo) {
      throw new Error('CourseRepository is not properly injected');
    }
  }

  /**
   * Helper to DRY version/module/section lookup.
   */
  private async findSection(
    versionId: string,
    moduleId: string,
    sectionId: string,
  ) {
    const version = await this.courseRepo.readVersion(versionId);
    if (!version) throw new HttpError(404, 'Course version not found');
    const module = version.modules.find(m => m.moduleId === moduleId);
    if (!module) throw new HttpError(404, 'Module not found');
    const section = module.sections.find(s => s.sectionId === sectionId);
    if (!section) throw new HttpError(404, 'Section not found');
    return {version, module, section};
  }

  /**
   * Create a new item under a specific section of a module in a course version.
   */
  @Authorized(['admin'])
  @Post('/versions/:versionId/modules/:moduleId/sections/:sectionId/items')
  @HttpCode(201)
  async create(
    @Params() params: CreateItemParams,
    @Body() body: CreateItemBody,
  ) {
    try {
      const {versionId, moduleId, sectionId} = params;
      const {version, module, section} = await this.findSection(
        versionId,
        moduleId,
        sectionId,
      );

      if (section.itemsGroupId === null) {
        throw new HttpError(404, 'Section itemsGroupId is missing');
      }

      // Always use plainToInstance for ItemsGroup for consistency
      const itemsGroup = plainToInstance(
        ItemsGroup,
        await this.courseRepo.readItemsGroup(section.itemsGroupId.toString()),
      );

      if (!itemsGroup) throw new HttpError(404, 'ItemsGroup not found');

      // Unique ID validation
      if (itemsGroup.items.some(item => item.itemId === body.itemId)) {
        throw new BadRequestError(
          'Item ID must be unique within the items group.',
        );
      }

      // Parameter tagging validation (for parameterized questions)
      if (body.isParameterized && body.parameters) {
        for (const param of Object.keys(body.parameters)) {
          if (!body.questionText.includes(`<QParam>${param}</QParam>`)) {
            throw new BadRequestError(
              `Parameter '${param}' is missing from questionText or not properly tagged.`,
            );
          }
        }
      }

      //Create Item
      const newItem = new Item(body, itemsGroup.items);

      //Add Item to ItemsGroup
      itemsGroup.items.push(newItem);

      //Update Section/Module/Version Update Dates
      section.updatedAt = new Date();
      module.updatedAt = new Date();
      version.updatedAt = new Date();

      const updatedItemsGroup = await this.courseRepo.updateItemsGroup(
        section.itemsGroupId.toString(),
        itemsGroup,
      );
      const updatedVersion = await this.courseRepo.updateVersion(
        versionId,
        version,
      );

      return {
        itemsGroup: instanceToPlain(updatedItemsGroup),
        version: instanceToPlain(updatedVersion),
      };
    } catch (error) {
      console.error('ItemController.create error:', error);
      if (error instanceof Error) {
        throw new HttpError(500, error.message);
      }
      throw error;
    }
  }

  /**
   * Retrieve all items from a section of a module in a course version.
   */
  @Authorized(['admin', 'instructor', 'student'])
  @Get('/versions/:versionId/modules/:moduleId/sections/:sectionId/items')
  async readAll(@Params() params: ReadAllItemsParams) {
    try {
      const {versionId, moduleId, sectionId} = params;
      const {section} = await this.findSection(versionId, moduleId, sectionId);

      if (section.itemsGroupId === null)
        throw new HttpError(404, 'Section itemsGroupId is missing');

      const itemsGroup = plainToInstance(
        ItemsGroup,
        await this.courseRepo.readItemsGroup(section.itemsGroupId.toString()),
      );
      if (!itemsGroup) throw new HttpError(404, 'ItemsGroup not found');

      return {
        itemsGroup: itemsGroup,
      };
    } catch (error) {
      console.error('ItemController.readAll error:', error);
      if (error instanceof Error) {
        throw new HttpError(500, error.message);
      }
      throw error;
    }
  }

  /**
   * Update an existing item in a section of a module in a course version.
   */
  @Authorized(['admin'])
  @Put(
    '/versions/:versionId/modules/:moduleId/sections/:sectionId/items/:itemId',
  )
  async update(
    @Params() params: UpdateItemParams,
    @Body() body: UpdateItemBody,
  ) {
    try {
      const {versionId, moduleId, sectionId, itemId} = params;
      const {version, module, section} = await this.findSection(
        versionId,
        moduleId,
        sectionId,
      );

      if (!section.itemsGroupId)
        throw new HttpError(404, 'Section itemsGroupId is missing');

      const itemsGroup = plainToInstance(
        ItemsGroup,
        await this.courseRepo.readItemsGroup(section.itemsGroupId.toString()),
      );
      if (!itemsGroup) throw new HttpError(404, 'ItemsGroup not found');

      //Find Item
      const item = itemsGroup.items.find(i => i.itemId === itemId);
      if (!item) throw new HttpError(404, 'Item not found');

      // Parameter tagging validation (for parameterized questions)
      if (body.isParameterized && body.parameters) {
        for (const param of Object.keys(body.parameters)) {
          if (!body.questionText.includes(`<QParam>${param}</QParam>`)) {
            throw new BadRequestError(
              `Parameter '${param}' is missing from questionText or not properly tagged.`,
            );
          }
        }
      }

      //Update Item (simplified and DRY)
      Object.assign(item, {
        ...(body.name && {name: body.name}),
        ...(body.description && {description: body.description}),
        ...(body.type && {type: body.type}),
        itemDetails:
          body.videoDetails ||
          body.blogDetails ||
          body.quizDetails ||
          item.itemDetails,
      });

      //Update Section/Module/Version Update Dates
      section.updatedAt = new Date();
      module.updatedAt = new Date();
      version.updatedAt = new Date();

      const updatedItemsGroup = await this.courseRepo.updateItemsGroup(
        section.itemsGroupId.toString(),
        itemsGroup,
      );
      const updatedVersion = await this.courseRepo.updateVersion(
        versionId,
        version,
      );

      return {
        itemsGroup: instanceToPlain(updatedItemsGroup),
        version: instanceToPlain(updatedVersion),
      };
    } catch (error) {
      console.error('ItemController.update error:', error);
      if (error instanceof Error) {
        throw new HttpError(500, error.message);
      }
      throw error;
    }
  }

  /**
   * Delete an item from a section of a module in a course version.
   */
  @Authorized(['instructor', 'admin'])
  @Delete('/itemGroups/:itemsGroupId/items/:itemId')
  async delete(@Params() params: DeleteItemParams) {
    try {
      const {itemsGroupId, itemId} = params;
      if (!itemsGroupId || !itemId) {
        throw new DeleteError('Missing required parameters');
      }

      const itemsGroup = plainToInstance(
        ItemsGroup,
        await this.courseRepo.readItemsGroup(itemsGroupId),
      );
      if (!itemsGroup) throw new DeleteError('ItemsGroup not found');

      const itemToDelete = itemsGroup.items.find(
        i =>
          i.itemId !== undefined &&
          i.itemId !== null &&
          i.itemId.toString() === itemId,
      );
      if (!itemToDelete) throw new DeleteError('Item not found');

      const deletionStatus = await this.courseRepo.deleteItem(
        itemsGroupId,
        itemId,
      );
      if (!deletionStatus) throw new Error('Unable to delete item');

      const updatedItemsGroup =
        await this.courseRepo.readItemsGroup(itemsGroupId);

      return {
        deletedItem: instanceToPlain(itemToDelete),
        updatedItemsGroup: instanceToPlain(updatedItemsGroup),
      };
    } catch (error) {
      console.error('ItemController.delete error:', error);
      if (error instanceof Error) {
        if (error.message === 'Item not found') {
          throw new HttpError(404, error.message);
        }
        if (error.message === 'Missing required parameters') {
          throw new BadRequestError(error.message);
        }
        throw new HttpError(500, error.message);
      }
      throw error;
    }
  }

  /**
   * Move an item to a new position within a section by recalculating its order.
   */
  @Authorized(['admin'])
  @Put(
    '/versions/:versionId/modules/:moduleId/sections/:sectionId/items/:itemId/move',
  )
  async move(@Params() params: MoveItemParams, @Body() body: MoveItemBody) {
    try {
      const {versionId, moduleId, sectionId, itemId} = params;
      const {afterItemId, beforeItemId} = body;

      if (!afterItemId && !beforeItemId) {
        throw new UpdateError('Either afterItemId or beforeItemId is required');
      }

      const {version, module, section} = await this.findSection(
        versionId,
        moduleId,
        sectionId,
      );

      if (!section.itemsGroupId)
        throw new HttpError(404, 'Section itemsGroupId is missing');

      const itemsGroup = plainToInstance(
        ItemsGroup,
        await this.courseRepo.readItemsGroup(section.itemsGroupId.toString()),
      );
      if (!itemsGroup) throw new HttpError(404, 'ItemsGroup not found');

      const item = itemsGroup.items.find(i => i.itemId === itemId);
      if (!item) throw new HttpError(404, 'Item not found');

      //Sort Items based on order
      const sortedItems = itemsGroup.items.sort((a, b) =>
        a.order.localeCompare(b.order),
      );

      //Calculate New Order
      const newOrder = calculateNewOrder(
        sortedItems,
        'itemId',
        afterItemId,
        beforeItemId,
      );

      //Update Item Order
      item.order = newOrder;

      //Change the updatedAt dates
      section.updatedAt = new Date();
      module.updatedAt = new Date();
      version.updatedAt = new Date();

      const updatedItemsGroup = await this.courseRepo.updateItemsGroup(
        section.itemsGroupId.toString(),
        itemsGroup,
      );
      const updatedVersion = await this.courseRepo.updateVersion(
        versionId,
        version,
      );

      return {
        itemsGroup: instanceToPlain(updatedItemsGroup),
        version: instanceToPlain(updatedVersion),
      };
    } catch (error) {
      console.error('ItemController.move error:', error);
      if (error instanceof UpdateError) {
        throw new BadRequestError(error.message);
      }
      if (error instanceof Error) {
        throw new HttpError(500, error.message);
      }
      throw error;
    }
  }
}
