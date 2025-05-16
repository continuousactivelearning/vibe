import {InternalServerError, NotFoundError} from 'routing-controllers';
import {ICourseRepository} from 'shared/database';
import {Inject, Service} from 'typedi';
import {CreateCourseVersionBody} from '../classes/validators';
import {CourseVersion} from '../classes/transformers';
import {ObjectId, ReadConcern, ReadPreference, WriteConcern} from 'mongodb';
import {ICourseVersion} from 'shared/interfaces/Models';

@Service()
export class CourseVersionService {
  constructor(
    @Inject('CourseRepo')
    private readonly courseRepo: ICourseRepository,
  ) {}

  public async createCourseVersion(
    courseId: string,
    body: CreateCourseVersionBody,
  ): Promise<ICourseVersion> {
    const session = (await this.courseRepo.getDBClient()).startSession();

    const transactionOptions = {
      readPreference: ReadPreference.primary,
      readConcern: new ReadConcern('snapshot'),
      writeConcern: new WriteConcern('majority'),
    };

    let newVersion: ICourseVersion;

    try {
      await session.startTransaction(transactionOptions);

      // Step 1: Fetch course
      const course = await this.courseRepo.read(courseId, session);
      if (!course) {
        throw new NotFoundError(`Course with ID ${courseId} not found.`);
      }

      // Step 2: Create new version
      newVersion = new CourseVersion(body);
      newVersion.courseId = new ObjectId(courseId);

      const createdVersion = await this.courseRepo.createVersion(
        newVersion,
        session,
      );
      if (!createdVersion) {
        throw new InternalServerError('Failed to create course version.');
      }

      newVersion = createdVersion;

      // Step 3: Update course metadata
      course.versions.push(createdVersion._id);
      course.updatedAt = new Date();

      const updatedCourse = await this.courseRepo.update(
        courseId,
        course,
        session,
      );
      if (!updatedCourse) {
        throw new InternalServerError(
          'Failed to update course with new version.',
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return newVersion;
  }
}
