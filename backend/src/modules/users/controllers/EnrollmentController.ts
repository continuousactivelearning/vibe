import {
  EnrollmentParams,
  EnrollUserResponse,
  EnrollmentResponse,
  EnrolledUserResponse,
  EnrollmentBody,
} from '#users/classes/index.js';
import {EnrollmentService} from '#users/services/EnrollmentService.js';
import {USERS_TYPES} from '#users/types.js';
import {injectable, inject} from 'inversify';
import {
  JsonController,
  Post,
  HttpCode,
  Params,
  Authorized,
  BadRequestError,
  Get,
  NotFoundError,
  Param,
  QueryParam,
  InternalServerError,
} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {
  EnrollmentParams,
  EnrollmentNotFoundErrorResponse,
  EnrollUserResponseData,
  EnrollmentResponse,
} from '../classes/validators/EnrollmentValidators.js';

@JsonController('/users', {transformResponse: true})
@injectable()
export class EnrollmentController {
  constructor(
    @inject(USERS_TYPES.EnrollmentService)
    private readonly enrollmentService: EnrollmentService,
  ) {}

  @Post('/:userId/enrollments/courses/:courseId/versions/:courseVersionId')
  @HttpCode(200)
  async enrollUser(
    @Params() params: EnrollmentParams,
    @Body() body: EnrollmentBody,
  ): Promise<EnrollUserResponse> {
    const {userId, courseId, courseVersionId} = params;
    const {role} = body;
    const responseData = await this.enrollmentService.enrollUser(
      userId,
      courseId,
      courseVersionId,
      role,
    );

    return new EnrollUserResponse(
      responseData.enrollment,
      responseData.progress,
      responseData.role,
    );
  }

  @Post(
    '/:userId/enrollments/courses/:courseId/versions/:courseVersionId/unenroll',
  )
  @HttpCode(200)
  async unenrollUser(
    @Params() params: EnrollmentParams,
  ): Promise<EnrollUserResponse> {
    const {userId, courseId, courseVersionId} = params;

    const responseData = await this.enrollmentService.unenrollUser(
      userId,
      courseId,
      courseVersionId,
    );

    return new EnrollUserResponse(
      responseData.enrollment,
      responseData.progress,
      responseData.role,
    );
  }

  @Authorized(['student'])
  @Get('/:userId/enrollments')
  @HttpCode(200)
  @OpenAPI({
    summary: 'Get User Enrollments',
    description:
      'Retrieves a paginated list of courses and course versions a user is enrolled in.',
  })
  @ResponseSchema(EnrollmentResponse, {
    description: 'List of user enrollments',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    statusCode: 400,
    description: 'Bad Request',
  })
  @ResponseSchema(EnrollmentNotFoundErrorResponse, {
    statusCode: 404,
    description: 'Enrollments Not Found',
  })
  async getUserEnrollments(
    @Param('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('limit') limit = 10,
  ): Promise<EnrollmentResponse> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestError('Page and limit must be positive integers.');
      }
      const skip = (page - 1) * limit;

      const enrollments = await this.enrollmentService.getEnrollments(
        userId,
        skip,
        limit,
      );
      const totalDocuments =
        await this.enrollmentService.countEnrollments(userId);

      if (!enrollments || enrollments.length === 0) {
        throw new NotFoundError('No enrollments found for the given user.');
      }

      return {
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        enrollments,
      };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('An unexpected error occurred.');
    }
  }
}
