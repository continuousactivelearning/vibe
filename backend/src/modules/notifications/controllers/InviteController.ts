import 'reflect-metadata';
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
  Body,
} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {InviteService} from '../services/InviteService';
import {InviteBody, InviteResponse} from '../classes/validators';
import {BadRequestErrorResponse} from 'shared/middleware/errorHandler';
import {SignUpBody} from 'modules/auth';

/**
 * Controller for managing student enrollments in courses.
 *
 * @category Invite/Controllers
 */
@OpenAPI({
  tags: ['Invite Notifications'],
})
@JsonController('/invite', {transformResponse: true})
@Service()
export class InviteController {
  constructor(
    @Inject('InviteService')
    private readonly inviteService: InviteService,
  ) {}

  //@Authorized(['instructor']) // Or use another role or remove if not required
  @Post('/courses/:courseId/versions/:courseVersionId')
  @HttpCode(200)
  @ResponseSchema(InviteResponse, {
    description: 'Invite users to a course version',
    statusCode: 200,
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Invalid input data',
    statusCode: 400,
  })
  @OpenAPI({
    summary: 'Invite multiple users to a course',
    description: 'Invites multiple users to a specific version of a course.',
  })
  async inviteUserToCourse(
    @Body() body: InviteBody,
    @Param('courseId') courseId: string,
    @Param('courseVersionId') courseVersionId: string,
  ) {
    console.log('Inviting users to course:', courseId, courseVersionId);
    console.log(body);
    return this.inviteService.inviteUserToCourse(
      body.email,
      courseId,
      courseVersionId,
    );
  }

  @Post('/signup/:token')
  @HttpCode(200)
  @OpenAPI({
    summary: 'Sign up new user through invite',
    description: 'Sign up a new user through an invite link.',
  })
  async signUpNewUser(
    @Body() body: SignUpBody,
    @QueryParam('token') token: string,
  ) {
    return this.inviteService.storeInvite();
  }

  @Post('/:token')
  @HttpCode(200)
  @OpenAPI({
    summary: 'Process Invite',
    description: 'Process an invite using a token.',
  })
  async process(@Param('token') token: string): Promise<{message: string}> {
    const result = await this.inviteService.processInvite(token);
    return {message: result};
  }
}
