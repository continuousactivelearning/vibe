import {ItemsGroup} from 'modules/courses/classes/transformers/index';
import {
  ICourse,
  ICourseVersion,
  IEnrollment,
  IProgress,
} from 'shared/interfaces/Models';
import {ClientSession, MongoClient, ObjectId} from 'mongodb';

export interface ICourseRepository {
  getDBClient(): Promise<MongoClient>;

  create(course: ICourse): Promise<ICourse | null>;
  read(id: string, session?: ClientSession): Promise<ICourse | null>;
  update(
    id: string,
    course: Partial<ICourse>,
    session?: ClientSession,
  ): Promise<ICourse | null>;
  delete(id: string): Promise<boolean>;

  createVersion(
    courseVersion: ICourseVersion,
    session?: ClientSession,
  ): Promise<ICourseVersion | null>;
  readVersion(versionId: string): Promise<ICourseVersion | null>;
  updateVersion(
    versionId: string,
    courseVersion: ICourseVersion,
  ): Promise<ICourseVersion | null>;

  createItemsGroup(itemsGroup: ItemsGroup): Promise<ItemsGroup | null>;
  readItemsGroup(itemsGroupId: string): Promise<ItemsGroup | null>;
  updateItemsGroup(
    itemsGroupId: string,
    itemsGroup: ItemsGroup,
  ): Promise<ItemsGroup | null>;

  getFirstOrderItems(courseVersionId: string): Promise<{
    moduleId: ObjectId;
    sectionId: ObjectId;
    itemId: ObjectId;
  }>;
}
