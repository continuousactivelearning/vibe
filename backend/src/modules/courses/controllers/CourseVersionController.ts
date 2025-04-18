import {instanceToPlain} from 'class-transformer';
import {ObjectId} from 'mongodb';
import 'reflect-metadata';
import {
  Authorized,
  Body,
  Get,
  HttpError,
  JsonController,
  Params,
  Post,
  Delete,
  BadRequestError,
} from 'routing-controllers';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {ItemNotFoundError, ReadError, DeleteError} from 'shared/errors/errors';
import {Inject, Service} from 'typedi';
import {CourseVersion} from '../classes/transformers/CourseVersion';
import {
  CreateCourseVersionParams,
  CreateCourseVersionBody,
  ReadCourseVersionParams,
  DeleteModuleParams,
} from '../classes/validators/CourseVersionValidators';

/**
 * Controller for handling course version operations like creation and retrieval.
 * All routes are prefixed with `/courses`.
 *
 * @category Courses/Controllers
 * @categoryDescription
 * Manages creation of new course versions and retrieval of version details.
 * Only authorized users (admin/instructor/student) may access relevant endpoints.
 */
@JsonController('/courses')
@Service()
export class CourseVersionController {
  constructor(
    @Inject('NewCourseRepo') private readonly courseRepo: CourseRepository,
  ) {}

  /**
   * Create a new version for a specific course.
   *
   * @param params - Parameters including the course ID (`:id`)
   * @param body - Payload containing version name and description
   * @returns The updated course and the newly created version
   *
   * @throws HttpError(404) if the course is not found
   * @throws HttpError(500) on any other internal error
   *
   * @category Courses/Controllers
   */
  @Authorized(['admin', 'instructor'])
  @Post('/:id/versions')
  async create(
    @Params() params: CreateCourseVersionParams,
    @Body() body: CreateCourseVersionBody,
  ) {
    const {id} = params;
    try {
      // console.log("id", id);
      // console.log("payload", payload);
      //Fetch Course from DB
      const course = await this.courseRepo.read(id);

      //Create Version
      let version = new CourseVersion(body);
      version.courseId = new ObjectId(id);
      version = (await this.courseRepo.createVersion(version)) as CourseVersion;

      //Add Version to Course
      course.versions.push(version._id);
      course.updatedAt = new Date();

      //Update Course
      const updatedCourse = await this.courseRepo.update(id, course);

      return {
        course: instanceToPlain(updatedCourse),
        version: instanceToPlain(version),
      };
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        throw new HttpError(404, error.message);
      }
      if (error instanceof ReadError) {
        throw new HttpError(500, error.message);
      }
      throw new HttpError(500, error.message);
    }
  }

  /**
   * Retrieve a course version by its ID.
   *
   * @param params - Parameters including version ID (`:id`)
   * @returns The course version object if found
   *
   * @throws HttpError(404) if the version is not found
   * @throws HttpError(500) for read errors
   *
   * @category Courses/Controllers
   */
  @Authorized(['admin', 'instructor', 'student'])
  @Get('/versions/:id')
  async read(@Params() params: ReadCourseVersionParams) {
    const {id} = params;
    try {
      const version = await this.courseRepo.readVersion(id);
      return instanceToPlain(version);
    } catch (error) {
      if (error instanceof ReadError) {
        throw new HttpError(500, error.message);
      }
      if (error instanceof ItemNotFoundError) {
        throw new HttpError(404, error.message);
      }
      throw new HttpError(500, error.message);
    }
  }

  /**
   * Delete a module from a specific course version.
   *
   * @param params - Parameters including version ID and module ID
   * @returns The deleted module object
   *
   * @throws BadRequestError if version ID or module ID is missing
   * @throws HttpError(404) if the module is not found
   * @throws HttpError(500) for delete errors
   *
   * @category Courses/Controllers
   */
  @Delete('/versions/:versionId/modules/:moduleId')
  async deleteModule(@Params() params: DeleteModuleParams) {
    const {versionId, moduleId} = params;
    if (!versionId || !moduleId) {
      throw new BadRequestError('Version ID and Module ID are required');
    }
    try {
      const deletedModule = await this.courseRepo.deleteModule(
        versionId,
        moduleId,
      );
      const deleted: any = deletedModule;
      return {
        deletedItem: instanceToPlain({
          ...deleted,
          moduleId: deleted?.moduleId?.toString(),
        }),
      };
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        throw new HttpError(404, error.message);
      }
      if (error instanceof DeleteError) {
        throw new HttpError(500, error.message);
      }
      throw new HttpError(500, error.message);
    }
  }
}
