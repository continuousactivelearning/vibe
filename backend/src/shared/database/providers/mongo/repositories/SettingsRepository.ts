import 'reflect-metadata';
import {Collection, ObjectId, UpdateResult} from 'mongodb';
import {Service, Inject} from 'typedi';
import {MongoDatabase} from '../MongoDatabase';
import {ICourseSettings, IUserSettings} from 'shared/interfaces/Models';
import {
  ISettingsRepository,
  ProctoringComponent,
} from 'shared/database/interfaces/ISettingsRepository';
import {CourseSettings} from 'modules/settings/classes/transformers/CourseSettings';

@Service()
export class SettingsRepository implements ISettingsRepository {
  // Define types for the collections later.
  private courseSettingsCollection: Collection<CourseSettings>;

  constructor(@Inject(() => MongoDatabase) private db: MongoDatabase) {}
  readCourseSettings(
    courseId: string,
    courseVersionId: string,
  ): Promise<ICourseSettings | null> {
    throw new Error('Method not implemented.');
  }
  addCourseProctoring(
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null> {
    throw new Error('Method not implemented.');
  }
  removeCourseProctoring(
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null> {
    throw new Error('Method not implemented.');
  }
  createUserSettings(
    userSettings: IUserSettings,
  ): Promise<IUserSettings | null> {
    throw new Error('Method not implemented.');
  }
  readUserSettings(
    studentId: string,
    courseId: string,
    courseVersionId: string,
  ): Promise<IUserSettings | null> {
    throw new Error('Method not implemented.');
  }
  addUserProctoring(
    studentId: string,
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null> {
    throw new Error('Method not implemented.');
  }
  removeUserProctoring(
    studentId: string,
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null> {
    throw new Error('Method not implemented.');
  }

  private initialized = false;

  private async init() {
    if (!this.initialized) {
      this.courseSettingsCollection =
        await this.db.getCollection<CourseSettings>('courseSettings');
      this.initialized = true;
    }
  }

  async createCourseSettings(
    courseSettings: CourseSettings,
  ): Promise<ICourseSettings | null> {
    await this.init();
    const result =
      await this.courseSettingsCollection.insertOne(courseSettings);
    if (result.acknowledged) {
      const createdSettings = await this.courseSettingsCollection.findOne({
        _id: result.insertedId,
      });

      return Object.assign(
        new CourseSettings(),
        createdSettings,
      ) as CourseSettings;
    } else {
      return null;
    }
  }
}
