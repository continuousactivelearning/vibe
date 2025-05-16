import {InternalServerError, NotFoundError} from 'routing-controllers';
import {ICourseRepository} from 'shared/database';
import {Inject, Service} from 'typedi';
import {CreateCourseVersionBody} from '../classes/validators';
import {CourseVersion} from '../classes/transformers';
import {ObjectId, ReadConcern, ReadPreference, WriteConcern} from 'mongodb';
import {ICourse} from 'shared/interfaces/Models';

@Service()
class CourseVersionService {
  constructor(
    @Inject('CourseRepo')
    private readonly courseRepo: ICourseRepository,
  ) {}

  async createCourseVersion(
    id: string,
    body: CreateCourseVersionBody,
  ): Promise<CourseVersion> {
    // Start a session for the transaction
    const session = (await this.courseRepo.getDBClient()).startSession();

    const transactionOptions = {
      readPreference: ReadPreference.primary,
      readConcern: new ReadConcern('snapshot'),
      writeConcern: new WriteConcern('majority'),
    };

    let version: CourseVersion | null = null;

    try {
      // Start the transaction
      await session.withTransaction(async () => {
        // Read the course
        const course = await this.courseRepo.read(id, session);
        if (!course) {
          throw new NotFoundError(
            'No course found with the specified ID. Please verify the ID and try again.',
          );
        }

        // Create a new course version
        version = new CourseVersion(body);
        version.courseId = new ObjectId(id);

        version = (await this.courseRepo.createVersion(
          version,
          session,
        )) as CourseVersion;
        if (!version) {
          throw new InternalServerError(
            'Failed to create course version. Please try again later.',
          );
        }

        course.versions.push(version._id);
        course.updatedAt = new Date();

        // Update the course with the new version
        const updatedCourse = await this.courseRepo.update(id, course, session);
        if (!updatedCourse) {
          throw new InternalServerError(
            'Failed to update course with new version. Please try again later.',
          );
        }
      }, transactionOptions);
    } finally {
      await session.endSession();
    }
    return version;
  }
}

export {CourseVersionService};
