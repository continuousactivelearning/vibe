import {Service, Inject} from 'typedi';
import {IItemRepository} from 'shared/database';
import {Item} from '../classes/transformers/Item';
import {
  CreateItemBody,
  UpdateItemBody,
  MoveItemBody,
} from '../classes/validators/ItemValidators';
import {calculateNewOrder} from '../utils/calculateNewOrder';

@Service()
export class ItemService {
  constructor(
    @Inject('ItemRepo')
    private readonly itemRepo: IItemRepository,
  ) {}

  async createItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    body: CreateItemBody,
  ) {
    const version = await this.itemRepo.readVersion(versionId);
    const module = version.modules.find(m => m.moduleId === moduleId)!;
    const section = module.sections.find(s => s.sectionId === sectionId)!;
    const itemsGroup = await this.itemRepo.readItemsGroup(
      section.itemsGroupId.toString(),
    );

    const newItem = new Item(body, itemsGroup.items);
    itemsGroup.items.push(newItem);
    section.updatedAt = new Date();
    module.updatedAt = new Date();
    version.updatedAt = new Date();

    const updatedItemsGroup = await this.itemRepo.updateItemsGroup(
      section.itemsGroupId.toString(),
      itemsGroup,
    );
    const updatedVersion = await this.itemRepo.updateVersion(
      versionId,
      version,
    );
    return {itemsGroup: updatedItemsGroup, version: updatedVersion};
  }

  async readAllItems(versionId: string, moduleId: string, sectionId: string) {
    const version = await this.itemRepo.readVersion(versionId);
    const module = version.modules.find(m => m.moduleId === moduleId)!;
    const section = module.sections.find(s => s.sectionId === sectionId)!;
    return this.itemRepo.readItemsGroup(section.itemsGroupId.toString());
  }

  async updateItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    itemId: string,
    body: UpdateItemBody,
  ) {
    const version = await this.itemRepo.readVersion(versionId);
    const module = version.modules.find(m => m.moduleId === moduleId)!;
    const section = module.sections.find(s => s.sectionId === sectionId)!;
    const itemsGroup = await this.itemRepo.readItemsGroup(
      section.itemsGroupId.toString(),
    );

    const item = itemsGroup.items.find(i => i.itemId.toString() === itemId)!;
    Object.assign(item, body);
    section.updatedAt = new Date();
    module.updatedAt = new Date();
    version.updatedAt = new Date();

    const updatedItemsGroup = await this.itemRepo.updateItemsGroup(
      section.itemsGroupId.toString(),
      itemsGroup,
    );
    const updatedVersion = await this.itemRepo.updateVersion(
      versionId,
      version,
    );
    return {itemsGroup: updatedItemsGroup, version: updatedVersion};
  }

  async deleteItem(itemsGroupId: string, itemId: string) {
    const deleted = await this.itemRepo.deleteItem(itemsGroupId, itemId);
    if (!deleted) throw new Error('Item deletion failed');
    const updatedItemsGroup = await this.itemRepo.readItemsGroup(itemsGroupId);
    return {deletedItemId: itemId, itemsGroup: updatedItemsGroup};
  }

  async moveItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    itemId: string,
    body: MoveItemBody,
  ) {
    const {afterItemId, beforeItemId} = body;
    if (!afterItemId && !beforeItemId) {
      throw new Error('Either afterItemId or beforeItemId is required');
    }
    return await this.itemRepo.withTransaction(async (repo, session) => {
      const version = await repo.readVersion(versionId);
      const module = version.modules.find(m => m.moduleId === moduleId)!;
      const section = module.sections.find(s => s.sectionId === sectionId)!;
      const itemsGroup = await repo.readItemsGroup(
        section.itemsGroupId.toString(),
      );

      const sortedItems = itemsGroup.items.sort((a, b) =>
        a.order.localeCompare(b.order),
      );
      const newOrder = calculateNewOrder(
        sortedItems,
        'itemId',
        afterItemId,
        beforeItemId,
      );
      const item = itemsGroup.items.find(i => i.itemId.toString() === itemId)!;
      item.order = newOrder;
      section.updatedAt = new Date();
      module.updatedAt = new Date();
      version.updatedAt = new Date();

      const updatedItemsGroup = await repo.updateItemsGroup(
        section.itemsGroupId.toString(),
        itemsGroup,
        session,
      );
      const updatedVersion = await repo.updateVersion(
        versionId,
        version,
        session,
      );
      return {itemsGroup: updatedItemsGroup, version: updatedVersion};
    });
  }
}
