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
  HttpCode,
  NotFoundError,
} from 'routing-controllers';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {DeleteError, ReadError} from 'shared/errors/errors';
import {Inject, Service} from 'typedi';
import {CourseVersion} from '../classes/transformers/CourseVersion';
import {
  OpenAPI,
  routingControllersToSpec,
  ResponseSchema,
} from 'routing-controllers-openapi';
import {
  CreateCourseVersionParams,
  CreateCourseVersionBody,
  ReadCourseVersionParams,
  DeleteCourseVersionParams,
  CourseVersionDataResponse,
} from '../classes/validators/CourseVersionValidators';
import {CourseVersionService} from '../services';
import {BadRequestErrorResponse} from 'shared/middleware/errorHandler';

@OpenAPI({
  tags: ['CourseVersions'],
})
@JsonController('/courses')
@Service()
export class CourseVersionController {
  constructor(
    @Inject('CourseVersionService')
    private readonly courseVersionService: CourseVersionService,
    @Inject('CourseRepo') private readonly courseRepo: CourseRepository,
  ) {}

  @Authorized(['admin', 'instructor'])
  @Post('/:id/versions', {transformResponse: true})
  @HttpCode(201)
  @ResponseSchema(CourseVersionDataResponse, {
    description: 'CourseVersion created successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @OpenAPI({
    summary: 'Create CourseVersion',
    description: 'Creates a new courseVersion with the provided details.',
  })
  async create(
    @Params() params: CreateCourseVersionParams,
    @Body() body: CreateCourseVersionBody,
  ) {
    const {id} = params;
    const createdCourseVersion =
      await this.courseVersionService.createCourseVersion(id, body);
    return createdCourseVersion;
  }

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
      if (error instanceof NotFoundError) {
        throw new HttpError(404, error.message);
      }
      throw new HttpError(500, error.message);
    }
  }

  @Authorized(['admin', 'instructor'])
  @Delete('/:courseId/versions/:versionId')
  async delete(@Params() params: DeleteCourseVersionParams) {
    const {courseId, versionId} = params;
    if (!versionId || !courseId) {
      throw new BadRequestError('Version ID is required');
    }
    try {
      const version = await this.courseRepo.deleteVersion(courseId, versionId);
      return {
        message: `Version with the ID ${versionId} has been deleted successfully.`,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new HttpError(404, error.message);
      }
      if (error instanceof DeleteError) {
        throw new HttpError(500, error.message);
      }
    }
  }
}
