import {
  CourseVersion,
  ItemsGroup,
} from 'modules/courses/classes/transformers/index';
import {
  ICourse,
  ICourseVersion,
  IEnrollment,
  IProgress,
} from 'shared/interfaces/Models';
import {ClientSession, DeleteResult, MongoClient, ObjectId} from 'mongodb';

export interface ICourseRepository {
  getDBClient(): Promise<MongoClient>;

  create(course: ICourse, session?: ClientSession): Promise<ICourse | null>;
  read(id: string): Promise<ICourse | null>;
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
  readVersion(
    versionId: string,
    session?: ClientSession,
  ): Promise<ICourseVersion | null>;
  updateVersion(
    versionId: string,
    courseVersion: ICourseVersion,
  ): Promise<ICourseVersion | null>;
  deleteVersion(
    courseId: string,
    versionId: string,
    itemGroupsIds: ObjectId[],
    session?: ClientSession,
  ): Promise<DeleteResult | null>;
}
