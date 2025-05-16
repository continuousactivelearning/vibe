import 'reflect-metadata';
import {instanceToPlain} from 'class-transformer';
import {Course} from 'modules/courses/classes/transformers/Course';
import {CourseVersion} from 'modules/courses/classes/transformers/CourseVersion';
import {Item, ItemsGroup} from 'modules/courses/classes/transformers/Item';
import {Collection, ObjectId} from 'mongodb';
import {ICourseRepository} from 'shared/database/interfaces/ICourseRepository';
import {
  CreateError,
  DeleteError,
  ReadError,
  UpdateError,
} from 'shared/errors/errors';
import {
  ICourse,
  IModule,
  IEnrollment,
  IProgress,
} from 'shared/interfaces/Models';
import {Service, Inject} from 'typedi';
import {MongoDatabase} from '../MongoDatabase';
import {NotFoundError} from 'routing-controllers';

@Service()
export class CourseRepository implements ICourseRepository {
  private courseCollection: Collection<Course>;
  private courseVersionCollection: Collection<CourseVersion>;
  private itemsGroupCollection: Collection<ItemsGroup>;

  constructor(@Inject(() => MongoDatabase) private db: MongoDatabase) {}

  private async init() {
    this.courseCollection = await this.db.getCollection<Course>('newCourse');
    this.courseVersionCollection =
      await this.db.getCollection<CourseVersion>('newCourseVersion');
    this.itemsGroupCollection =
      await this.db.getCollection<ItemsGroup>('itemsGroup');
  }

  async create(course: Course): Promise<Course | null> {
    await this.init();
    const result = await this.courseCollection.insertOne(course);
    if (result.acknowledged) {
      const newCourse = await this.courseCollection.findOne({
        _id: result.insertedId,
      });
      return Object.assign(new Course(), newCourse) as Course;
    } else {
      return null;
    }
  }

  async read(id: string): Promise<ICourse | null> {
    await this.init();
    const course = await this.courseCollection.findOne({
      _id: new ObjectId(id),
    });
    if (course) {
      return Object.assign(new Course(), course) as Course;
    } else {
      return null;
    }
  }

  async update(id: string, course: Partial<ICourse>): Promise<ICourse | null> {
    await this.init();
    await this.read(id);

    const {_id: _, ...fields} = course;
    const res = await this.courseCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: fields},
      {returnDocument: 'after'},
    );

    if (res) {
      return Object.assign(new Course(), res) as Course;
    } else {
      return null;
    }
  }
  async delete(id: string): Promise<boolean> {
    console.log('delete course', id);
    throw new Error('Method not implemented.');
  }

  async createVersion(
    courseVersion: CourseVersion,
  ): Promise<CourseVersion | null> {
    await this.init();
    try {
      const result =
        await this.courseVersionCollection.insertOne(courseVersion);
      if (result.acknowledged) {
        const newCourseVersion = await this.courseVersionCollection.findOne({
          _id: result.insertedId,
        });

        return instanceToPlain(
          Object.assign(new CourseVersion(), newCourseVersion),
        ) as CourseVersion;
      } else {
        throw new CreateError('Failed to create course version');
      }
    } catch (error) {
      throw new CreateError(
        'Failed to create course version.\n More Details: ' + error,
      );
    }
  }

  async readVersion(versionId: string): Promise<CourseVersion | null> {
    await this.init();
    try {
      const courseVersion = await this.courseVersionCollection.findOne({
        _id: new ObjectId(versionId),
      });

      if (courseVersion === null) {
        throw new NotFoundError('Course Version not found');
      }

      return instanceToPlain(
        Object.assign(new CourseVersion(), courseVersion),
      ) as CourseVersion;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ReadError(
        'Failed to read course version.\n More Details: ' + error,
      );
    }
  }

  async updateVersion(
    versionId: string,
    courseVersion: CourseVersion,
  ): Promise<CourseVersion | null> {
    await this.init();
    try {
      const {_id: _, ...fields} = courseVersion;
      const result = await this.courseVersionCollection.updateOne(
        {_id: new ObjectId(versionId)},
        {$set: fields},
      );
      if (result.modifiedCount === 1) {
        const updatedCourseVersion = await this.courseVersionCollection.findOne(
          {
            _id: new ObjectId(versionId),
          },
        );
        return instanceToPlain(
          Object.assign(new CourseVersion(), updatedCourseVersion),
        ) as CourseVersion;
      } else {
        throw new UpdateError('Failed to update course version');
      }
    } catch (error) {
      throw new UpdateError(
        'Failed to update course version.\n More Details: ' + error,
      );
    }
  }

  async deleteVersion(
    courseId: string,
    versionId: string,
  ): Promise<CourseVersion | null> {
    await this.init();
    try {
      // 1. find the course version to Delete.
      const courseVersion = await this.courseVersionCollection.findOne({
        _id: new ObjectId(versionId),
      });

      const course = await this.courseCollection.findOne({
        _id: new ObjectId(courseId),
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // 2. check if the course version exists.
      if (!courseVersion) {
        throw new NotFoundError('Course Version not found');
      }

      // 3. Extract itemGroupsIds before deleting the course version.
      const itemGroupsIds = courseVersion.modules.flatMap(module =>
        module.sections.map(section => new ObjectId(section.itemsGroupId)),
      );

      // 4. Delete course version
      const versionDeleteResult = await this.courseVersionCollection.deleteOne({
        _id: new ObjectId(versionId),
      });

      if (versionDeleteResult.deletedCount !== 1) {
        throw new DeleteError('Failed to delete course version');
      }

      // 5. Remove courseVersionId from the course

      const courseUpdateResult = await this.courseCollection.updateOne(
        {_id: new ObjectId(courseId)},
        {$pull: {versions: versionId}},
      );

      if (courseUpdateResult.modifiedCount !== 1) {
        throw new DeleteError('Failed to update course');
      }

      // 6. Cascade Delete item groups

      const itemDeletionResult = await this.itemsGroupCollection.deleteMany({
        _id: {$in: itemGroupsIds},
      });

      if (itemDeletionResult.deletedCount === 0) {
        throw new DeleteError('Failed to delete item groups');
      }

      // 7. Return the deleted course version
      return courseVersion;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DeleteError(
        'Failed to delete course version.\n More Details: ' + error,
      );
    }
  }
}
