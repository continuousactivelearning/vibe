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

  readVersion(
    versionId: string,
    session?: ClientSession,
  ): Promise<ICourseVersion | null>;

  updateVersion(
    versionId: string,
    courseVersion: ICourseVersion,
    session?: ClientSession,
  ): Promise<ICourseVersion | null>;
}
