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
  InternalServerError,
} from 'routing-controllers';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {Inject, Service} from 'typedi';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {
  CreateCourseVersionParams,
  CreateCourseVersionBody,
  ReadCourseVersionParams,
  DeleteCourseVersionParams,
  CourseVersionDataResponse,
  CourseVersionNotFoundErrorResponse,
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
  @HttpCode(201)
  @ResponseSchema(CourseVersionDataResponse, {
    description: 'CourseVersion retrieved successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(CourseVersionNotFoundErrorResponse, {
    description: 'CourseVersion not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'Read CourseVersion',
    description:
      'Retrieves a courseVersion with the provided Course Version id.',
  })
  async read(@Params() params: ReadCourseVersionParams) {
    const {id} = params;
    const retrievedCourseVersion =
      await this.courseVersionService.readCourseVersion(id);
    return retrievedCourseVersion;
  }

  @Authorized(['admin', 'instructor'])
  @Delete('/:courseId/versions/:versionId')
  @HttpCode(201)
  @ResponseSchema(CourseVersionDataResponse, {
    description: 'CourseVersion deleted successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  @ResponseSchema(CourseVersionNotFoundErrorResponse, {
    description: 'CourseVersion not found',
    statusCode: 404,
  })
  @OpenAPI({
    summary: 'delete CourseVersion',
    description:
      'Deletes a courseVersion with the provided Course id and courseVersionId.',
  })
  async delete(@Params() params: DeleteCourseVersionParams) {
    const {courseId, versionId} = params;
    if (!versionId || !courseId) {
      throw new BadRequestError('Version ID is required');
    }
    const deletedVersion = await this.courseVersionService.deleteCourseVersion(
      courseId,
      versionId,
    );
    if (!deletedVersion) {
      throw new InternalServerError(
        'Failed to Delete Version, Please try again later',
      );
    }
    return {
      message: `Version with the ID ${versionId} has been deleted successfully.`,
    };
  }
}
