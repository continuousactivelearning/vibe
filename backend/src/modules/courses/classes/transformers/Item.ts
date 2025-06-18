import 'reflect-metadata';
import {Expose, Transform, Type} from 'class-transformer';
import {calculateNewOrder} from 'modules/courses/utils/calculateNewOrder';
import {ObjectId} from 'mongodb';
import {
  ObjectIdToString,
  StringToObjectId,
} from 'shared/constants/transformerConstants';
import {
  IBaseItem,
  ItemType,
  IVideoDetails,
  IQuizDetails,
  IBlogDetails,
} from 'shared/interfaces/IUser';
import {ID} from 'shared/types';
import {CreateItemBody, UpdateItemBody} from '../validators/ItemValidators';
/**
 * Item data transformation.
 *
 * @category Courses/Transformers/Item
 */
class Item implements IBaseItem {
  updateFromBody(body: UpdateItemBody) {
    throw new Error('Method not implemented.');
  }
  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  itemId?: ID;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  type: ItemType;

  @Expose()
  order: string;

  itemDetails: IVideoDetails | IQuizDetails | IBlogDetails;

  constructor(itemBody: CreateItemBody, existingItems: Item[]) {
    if (itemBody) {
      this.name = itemBody.name;
      this.description = itemBody.description;
      this.type = itemBody.type;
      switch (this.type) {
        case ItemType.VIDEO:
          this.itemDetails = itemBody.videoDetails ?? ({} as IVideoDetails);
          break;
        case ItemType.QUIZ:
          this.itemDetails = itemBody.quizDetails ?? ({} as IQuizDetails);
          break;
        case ItemType.BLOG:
          this.itemDetails = itemBody.blogDetails ?? ({} as IBlogDetails);
          break;
        default:
          // Assign a default value to satisfy the type
          this.itemDetails = {} as IVideoDetails | IQuizDetails | IBlogDetails;
          break;
      }
    } else {
      // Assign a default value if itemBody is not provided
      this.itemDetails = {} as IVideoDetails | IQuizDetails | IBlogDetails;
    }
    this.itemId = new ObjectId();

    // to faciliate plain and instance conversion.
    if (existingItems) {
      const sortedItems = existingItems.sort((a, b) =>
        a.order.localeCompare(b.order),
      );
      this.order = calculateNewOrder(
        sortedItems,
        'itemId',
        itemBody.afterItemId,
        itemBody.beforeItemId,
      );
    }
  }
}

/**
 * Items Group data transformation.
 *
 * @category Courses/Transformers
 */
class ItemsGroup {
  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  @Expose()
  @Type(() => Item)
  items: Item[];

  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  sectionId: ID;

  constructor(sectionId?: ID, items?: Item[]) {
    this.items = items ? items : [];
    this.sectionId = sectionId ?? ('' as ID);
  }
}

export {Item, ItemsGroup};
