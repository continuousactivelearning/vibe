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
} from '../classes/validators/ItemValidators';
import {ItemService} from '../services';
import {OpenAPI} from 'routing-controllers-openapi';

@OpenAPI({
  tags: ['Items'],
})
@JsonController('/items')
@Service()
export class ItemController {
  constructor(
    @Inject('ItemService') private readonly itemService: ItemService,
  ) {}

  @Authorized(['admin', 'instructor'])
  @Post('/:versionId/:moduleId/:sectionId')
  @HttpCode(201)
  @OpenAPI({
    summary: 'Create Item',
    description: 'Creates a new item within a section.',
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

  @Authorized(['admin', 'instructor'])
  @Get('/:versionId/:moduleId/:sectionId')
  @OpenAPI({
    summary: 'Read All Items',
    description: 'Retrieves all items from a section.',
  })
  async readAll(@Params() params: ReadAllItemsParams) {
    const {versionId, moduleId, sectionId} = params;
    return await this.itemService.readAllItems(versionId, moduleId, sectionId);
  }

  @Authorized(['admin', 'instructor'])
  @Put('/:versionId/:moduleId/:sectionId/:itemId')
  @OpenAPI({
    summary: 'Update Item',
    description: 'Updates an existing item.',
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

  @Authorized(['admin', 'instructor'])
  @Delete('/:itemsGroupId/:itemId')
  @OpenAPI({
    summary: 'Delete Item',
    description: 'Deletes an item from the items group.',
  })
  async delete(@Params() params: DeleteItemParams) {
    const {itemsGroupId, itemId} = params;
    return await this.itemService.deleteItem(itemsGroupId, itemId);
  }

  @Authorized(['admin', 'instructor'])
  @Put('/move/:versionId/:moduleId/:sectionId/:itemId')
  @OpenAPI({
    summary: 'Move Item',
    description:
      'Reorders an item within its section by moving it before or after another item.',
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
