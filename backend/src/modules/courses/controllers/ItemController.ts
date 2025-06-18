import {Inject, Service} from 'typedi';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {Item, ItemsGroup} from '../classes/transformers/Item';
import {plainToInstance, instanceToPlain} from 'class-transformer';
import {
  HttpError,
  BadRequestError,
  JsonController,
  Authorized,
  Post,
  HttpCode,
  Params,
  Body,
  Get,
  Put,
  Delete,
} from 'routing-controllers';
import {
  CreateItemBody,
  UpdateItemBody,
  MoveItemBody,
  CreateItemParams,
  UpdateItemParams,
  DeleteItemParams,
  MoveItemParams,
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
export class ItemController {
  constructor(
    @Inject('CourseRepo') private readonly courseRepo: CourseRepository,
    @Inject('ItemService') private readonly itemService: ItemService,
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
   */
  @Authorized(['admin', 'instructor', 'student'])
  @Get('/versions/:versionId/modules/:moduleId/sections/:sectionId/items')
  async readAll(
    @Params() params: {versionId: string; moduleId: string; sectionId: string},
  ) {
    const {versionId, moduleId, sectionId} = params;
    return await this.itemService.readAllItems(versionId, moduleId, sectionId);
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
   */
  @Authorized(['instructor', 'admin'])
  @Delete('/itemGroups/:itemsGroupId/items/:itemId')
  async delete(@Params() params: DeleteItemParams) {
    const {itemsGroupId, itemId} = params;
    return await this.itemService.deleteItem(itemsGroupId, itemId);
  }

  /**
   * Move an item to a new position within a section by recalculating its order.
   */
  @Authorized(['admin'])
  @Put(
    '/versions/:versionId/modules/:moduleId/sections/:sectionId/items/:itemId/move',
  )
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

@Service()
export class ItemService {
  constructor(
    @Inject('CourseRepo') private readonly courseRepo: CourseRepository,
  ) {}

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

  async createItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    body: CreateItemBody,
  ) {
    const {version, module, section} = await this.findSection(
      versionId,
      moduleId,
      sectionId,
    );

    if (section.itemsGroupId === null || section.itemsGroupId === undefined) {
      throw new HttpError(404, 'Section itemsGroupId is missing');
    }

    const itemsGroup = plainToInstance(
      ItemsGroup,
      await this.courseRepo.readItemsGroup(section.itemsGroupId.toString()),
    );
    if (!itemsGroup) throw new HttpError(404, 'ItemsGroup not found');

    // Unique itemId check
    if (itemsGroup.items.some(item => item.itemId === body.itemId)) {
      throw new BadRequestError(
        'Item ID must be unique within the items group.',
      );
    }

    // Parameter tagging validation for parameterized questions
    if (body.isParameterized && body.parameters) {
      for (const param of Object.keys(body.parameters)) {
        if (!body.questionText.includes(`<QParam>${param}</QParam>`)) {
          throw new BadRequestError(
            `Parameter '${param}' is missing from questionText or not properly tagged.`,
          );
        }
      }
    }

    // (Optional) Extra: Check for extra tags in questionText not present in parameters
    // const paramTagRegex = /<QParam>(.*?)<\/QParam>/g;
    // const tagsInText = Array.from(body.questionText.matchAll(paramTagRegex)).map(m => m[1]);
    // for (const tag of tagsInText) {
    //   if (!Object.keys(body.parameters).includes(tag)) {
    //     throw new BadRequestError(`Tag '${tag}' in questionText is not present in parameters.`);
    //   }
    // }

    const newItem = new Item(body, itemsGroup.items);
    itemsGroup.items.push(newItem);

    // Update timestamps
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
  }

  async readAllItems(versionId: string, moduleId: string, sectionId: string) {
    const {section} = await this.findSection(versionId, moduleId, sectionId);

    if (section.itemsGroupId === null || section.itemsGroupId === undefined) {
      throw new HttpError(404, 'Section itemsGroupId is missing');
    }

    const itemsGroup = await this.courseRepo.readItemsGroup(
      section.itemsGroupId.toString(),
    );
    if (!itemsGroup) throw new HttpError(404, 'ItemsGroup not found');

    return plainToInstance(ItemsGroup, itemsGroup);
  }

  async updateItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    itemId: string,
    body: UpdateItemBody,
  ) {
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

    const itemIndex = itemsGroup.items.findIndex(i => i.itemId === itemId);
    if (itemIndex === -1) throw new HttpError(404, 'Item not found');

    // (Optional) Add parameter/tag validation here if needed for updates

    itemsGroup.items[itemIndex].updateFromBody(body);

    // Update timestamps
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
  }

  async deleteItem(itemsGroupId: string, itemId: string) {
    const itemsGroup = plainToInstance(
      ItemsGroup,
      await this.courseRepo.readItemsGroup(itemsGroupId.toString()),
    );
    if (!itemsGroup) throw new HttpError(404, 'ItemsGroup not found');

    const index = itemsGroup.items.findIndex(i => i.itemId === itemId);
    if (index === -1) throw new HttpError(404, 'Item not found');

    itemsGroup.items.splice(index, 1);

    const updatedItemsGroup = await this.courseRepo.updateItemsGroup(
      itemsGroupId,
      itemsGroup,
    );

    return {
      itemsGroup: instanceToPlain(updatedItemsGroup),
    };
  }

  async moveItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    itemId: string,
    body: MoveItemBody,
  ) {
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

    const item = itemsGroup.items.find(i => i.itemId === itemId);
    if (!item) throw new HttpError(404, 'Item not found');

    // Calculate new order using utility
    const newOrder = calculateNewOrder(
      itemsGroup.items,
      'itemId',
      body.afterItemId,
      body.beforeItemId,
    );
    item.order = newOrder;

    // Update timestamps
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
  }
}
