import {ItemsGroup} from 'modules/courses/classes/transformers/index';
import {
  IBaseItem,
  IVideoDetails,
  IQuizDetails,
  IBlogDetails,
  ICourseVersion,
} from 'shared/interfaces/Models';
import {ObjectId, ClientSession} from 'mongodb';

export interface IItemRepository {
  createItem(item: IBaseItem): Promise<IBaseItem | null>;
  readItem(courseVersionId: string, itemId: string): Promise<IBaseItem | null>;
  updateItem(
    itemId: string,
    item: Partial<IBaseItem>,
  ): Promise<IBaseItem | null>;
  deleteItem(itemGroupsId: string, itemId: string): Promise<boolean>;
  createItemsGroup(itemsGroup: ItemsGroup): Promise<ItemsGroup | null>;
  readItemsGroup(itemsGroupId: string): Promise<ItemsGroup | null>;
  updateItemsGroup(
    itemsGroupId: string,
    itemsGroup: ItemsGroup,
    session?: ClientSession,
  ): Promise<ItemsGroup | null>;
  getFirstOrderItems(courseVersionId: string): Promise<{
    moduleId: ObjectId;
    sectionId: ObjectId;
    itemId: ObjectId;
  }>;
  readVersion(versionId: string): Promise<ICourseVersion | null>;
  updateVersion(
    versionId: string,
    version: ICourseVersion,
    session?: ClientSession,
  ): Promise<ICourseVersion | null>;

  // createVideoDetails(details: IVideoDetails): Promise<string>;
  // createQuizDetails(details: IQuizDetails): Promise<string>;
  // createBlogDetails(details: IBlogDetails): Promise<string>;

  // readVideoDetails(detailsId: string): Promise<IVideoDetails | null>;
  // readQuizDetails(detailsId: string): Promise<IQuizDetails | null>;
  // readBlogDetails(detailsId: string): Promise<IBlogDetails | null>;

  withTransaction<T>(
    fn: (repo: IItemRepository, session: ClientSession) => Promise<T>,
  ): Promise<T>;
}
