import {Service, Inject} from 'typedi';
import {InternalServerError, NotFoundError} from 'routing-controllers';
import {IItemRepository} from 'shared/database';
import {ICourseRepository} from 'shared/database/';
import {
  BlogItem,
  Item,
  ItemBase,
  ItemRef,
  ItemsGroup,
  QuizItem,
  VideoItem,
} from '../classes/transformers/Item';
import {
  CreateItemBody,
  UpdateItemBody,
  MoveItemBody,
} from '../classes/validators/ItemValidators';
import {calculateNewOrder} from '../utils/calculateNewOrder';
import {
  ClientSession,
  ReadConcern,
  ReadPreference,
  WriteConcern,
} from 'mongodb';
import {ItemType} from 'shared/interfaces/Models';
import {CourseVersion, Module, Section} from '../classes/transformers';

@Service()
export class ItemService {
  constructor(
    @Inject('ItemRepo')
    private readonly itemRepo: IItemRepository,
    @Inject('CourseRepo')
    private readonly courseRepo: ICourseRepository,
  ) {}

  private async _withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const client = await this.courseRepo.getDBClient();
    const session = client.startSession();
    const txOptions = {
      readPreference: ReadPreference.primary,
      readConcern: new ReadConcern('snapshot'),
      writeConcern: new WriteConcern('majority'),
    };

    try {
      await session.startTransaction(txOptions);
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      // Ensure abort is only called if a transaction is in progress
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error; // Re-throw the original error
    } finally {
      await session.endSession();
    }
  }

  private async _getVersionModuleSectionAndItemsGroup(
    versionId: string,
    moduleId: string,
    sectionId: string,
    session?: ClientSession,
  ): Promise<{
    version: CourseVersion;
    module: Module;
    section: Section;
    itemsGroup: ItemsGroup;
  }> {
    const version = (await this.courseRepo.readVersion(
      versionId,
      session,
    )) as CourseVersion;
    if (!version) throw new NotFoundError(`Version ${versionId} not found.`);

    const module = version.modules.find(m => m.moduleId === moduleId);
    if (!module)
      throw new NotFoundError(
        `Module ${moduleId} not found in version ${versionId}.`,
      );

    const section = module.sections.find(s => s.sectionId === sectionId);
    if (!section)
      throw new NotFoundError(
        `Section ${sectionId} not found in module ${moduleId}.`,
      );

    const itemsGroup = await this.itemRepo.readItemsGroup(
      section.itemsGroupId.toString(),
      session,
    );
    if (!itemsGroup) {
      throw new NotFoundError(
        `Items group for section ${sectionId} not found.`,
      );
    }

    return {version, module, section, itemsGroup};
  }

  private async _updateHierarchyAndVersion(
    version: CourseVersion,
    module: {updatedAt: Date},
    section: {updatedAt: Date},
    session?: import('mongodb').ClientSession, // Pass session if version update is part of the transaction
  ): Promise<CourseVersion> {
    const now = new Date();
    section.updatedAt = now;
    module.updatedAt = now;
    version.updatedAt = now;

    return (await this.courseRepo.updateVersion(
      version._id.toString(),
      version,
      session,
    )) as CourseVersion; // Assuming version has _id
  }

  public async createItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    body: CreateItemBody,
  ) {
    return this._withTransaction(async session => {
      //Step 1: Fetch and validate parent entities (version, module, section) and the itemsGroup.
      const {version, module, section, itemsGroup} =
        await this._getVersionModuleSectionAndItemsGroup(
          versionId,
          moduleId,
          sectionId,
          session,
        );

      //Step 2: Create a new item instance in memory.
      const item = new ItemBase(body, itemsGroup.items);

      //Step 3: Store the item-specific details in the repository.
      const createdItemDetailsPersistenceResult =
        await this.itemRepo.createItem(item.itemDetails, session);

      // Step 3a: Check if the item-specific details were successfully created.
      if (!createdItemDetailsPersistenceResult) {
        throw new InternalServerError(
          'Persistence of item-specific details failed in the repository.',
        );
      }

      //Step 4: Create a new ItemDB instance to represent the item in the itemsGroup.
      const newItemDB = new ItemRef(item); // ItemDB transforms/wraps the ItemBase instance for storage.
      itemsGroup.items.push(newItemDB);

      //Step 5: Save the modified 'itemsGroup' (now containing the new item) back to the database.
      const updatedItemsGroupResult = await this.itemRepo.updateItemsGroup(
        section.itemsGroupId.toString(),
        itemsGroup,
        session,
      );

      //Step 6: Update the 'updatedAt' timestamps for the modified section, module, and version.
      const updatedVersion = await this._updateHierarchyAndVersion(
        version,
        module,
        section,
        session,
      );
      return {
        itemsGroup: updatedItemsGroupResult,
        version: updatedVersion,
        createdItem: newItemDB,
      };
    });
  }

  public async readAllItems(
    versionId: string,
    moduleId: string,
    sectionId: string,
  ): Promise<ItemRef[]> {
    const {itemsGroup} = await this._getVersionModuleSectionAndItemsGroup(
      versionId,
      moduleId,
      sectionId,
    );
    return itemsGroup.items;
  }

  public async readItem(versionId: string, itemId: string) {
    const item = await this.itemRepo.readItem(versionId, itemId);
    return item;
  }

  public async updateItem(
    versionId: string,
    moduleId: string,
    sectionId: string,
    itemId: string,
    body: UpdateItemBody,
  ) {
    const client = await this.courseRepo.getDBClient();
    const session = client.startSession();
    const txOptions = {
      readPreference: ReadPreference.primary,
      readConcern: new ReadConcern('snapshot'),
      writeConcern: new WriteConcern('majority'),
    };

    try {
      await session.startTransaction(txOptions);

      const version = await this.courseRepo.readVersion(versionId, session);
      if (!version) throw new NotFoundError(`Version ${versionId} not found.`);
      const module = version.modules.find(m => m.moduleId === moduleId)!;
      const section = module.sections.find(s => s.sectionId === sectionId)!;
      const itemsGroup = await this.itemRepo.readItemsGroup(
        section.itemsGroupId.toString(),
        session,
      );

      const item = itemsGroup.items.find(i => i._id.toString() === itemId)!;
      Object.assign(item, body);
      section.updatedAt = new Date();
      module.updatedAt = new Date();
      version.updatedAt = new Date();

      const updatedItemsGroup = await this.itemRepo.updateItemsGroup(
        section.itemsGroupId.toString(),
        itemsGroup,
        session,
      );
      const updatedVersion = await this.courseRepo.updateVersion(
        versionId,
        version,
      );

      await session.commitTransaction();
      return {itemsGroup: updatedItemsGroup, version: updatedVersion};
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public async deleteItem(itemsGroupId: string, itemId: string) {
    const client = await this.courseRepo.getDBClient();
    const session = client.startSession();
    const txOptions = {
      readPreference: ReadPreference.primary,
      readConcern: new ReadConcern('snapshot'),
      writeConcern: new WriteConcern('majority'),
    };

    try {
      await session.startTransaction(txOptions);

      const deleted = await this.itemRepo.deleteItem(
        itemsGroupId,
        itemId,
        session,
      );
      if (!deleted) throw new InternalServerError('Item deletion failed');

      const updatedItemsGroup = await this.itemRepo.readItemsGroup(
        itemsGroupId,
        session,
      );

      await session.commitTransaction();
      return {deletedItemId: itemId, itemsGroup: updatedItemsGroup};
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public async moveItem(
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

    const client = await this.courseRepo.getDBClient();
    const session = client.startSession();
    const txOptions = {
      readPreference: ReadPreference.primary,
      readConcern: new ReadConcern('snapshot'),
      writeConcern: new WriteConcern('majority'),
    };

    try {
      await session.startTransaction(txOptions);

      const version = await this.courseRepo.readVersion(versionId, session);
      const module = version.modules.find(m => m.moduleId === moduleId)!;
      const section = module.sections.find(s => s.sectionId === sectionId)!;
      const itemsGroup = await this.itemRepo.readItemsGroup(
        section.itemsGroupId.toString(),
        session,
      );

      const sortedItems = itemsGroup.items.sort((a, b) =>
        a.order.localeCompare(b.order),
      );
      const newOrder = calculateNewOrder(
        sortedItems,
        '_id',
        afterItemId,
        beforeItemId,
      );
      const item = itemsGroup.items.find(i => i._id.toString() === itemId)!;
      item.order = newOrder;

      // Sort items by order after updating
      itemsGroup.items.sort((a, b) => a.order.localeCompare(b.order));

      section.updatedAt = new Date();
      module.updatedAt = new Date();
      version.updatedAt = new Date();

      const updatedItemsGroup = await this.itemRepo.updateItemsGroup(
        section.itemsGroupId.toString(),
        itemsGroup,
        session,
      );
      const updatedVersion = await this.courseRepo.updateVersion(
        versionId,
        version,
      );

      await session.commitTransaction();
      return {itemsGroup: updatedItemsGroup, version: updatedVersion};
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
