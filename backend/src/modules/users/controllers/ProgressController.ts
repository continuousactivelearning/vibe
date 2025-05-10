import 'reflect-metadata';
import {
  Authorized,
  Body,
  Get,
  HttpCode,
  InternalServerError,
  JsonController,
  OnUndefined,
  Params,
  Patch,
  Post,
} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {Progress} from '../classes/transformers';
import {IsMongoId, IsNotEmpty, IsString} from 'class-validator';
import {ProgressService} from '../services/ProgressService';
import {Expose} from 'class-transformer';

export class GetUserProgressParams {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseVersionId: string;
}

export class StartItemBody {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  itemId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  moduleId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  sectionId: string;
}

export class StartItemParams {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseVersionId: string;
}

export class StartItemResponse {
  @Expose()
  watchItemId: string;

  constructor(data: Partial<StartItemResponse>) {
    Object.assign(this, data);
  }
}

export class StopItemParams {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseVersionId: string;
}

export class StopItemBody {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  watchItemId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  itemId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  sectionId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  moduleId: string;
}

export class UpdateProgressBody {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  moduleId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  sectionId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  itemId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  watchItemId: string;
}

export class UpdateProgressParams {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseVersionId: string;
}

export class ResetItemProgressParams {
  /**
   * User ID of the student whose item progress is being reset
   */

  @IsString()
  @IsNotEmpty()
  userId: string;

  /**
   * ID of the course which the item belongs to
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  courseId: string;

  /**
   * ID of the courseVersion which the item belongs to
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  courseVersionId: string;

  /**
   * ID of the module which needs to be assigned to the currentModule in progress
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  /**
   * ID of the section which needs to be assigned to the currentSection in progress
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  sectionId: string;

  /**
   * ID of the item which needs to be assigned to the currentSection in progress
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  itemId: string;
}

@JsonController('/users', {transformResponse: true})
@Service()
/**
 * Controller for managing user progress in courses.
 *
 * @category Users/Controllers
 */
class ProgressController {
  constructor(
    @Inject('ProgressService')
    private readonly progressService: ProgressService,
  ) {}

  @Get('/:userId/progress/courses/:courseId/versions/:courseVersionId/')
  @HttpCode(200)
  async getUserProgress(
    @Params() params: GetUserProgressParams,
  ): Promise<Progress> {
    const {userId, courseId, courseVersionId} = params;

    const progress = await this.progressService.getUserProgress(
      userId,
      courseId,
      courseVersionId,
    );

    return progress;
  }
  @Post('/:userId/progress/courses/:courseId/versions/:courseVersionId/start')
  @HttpCode(200)
  async startItem(
    @Params() params: StartItemParams,
    @Body() body: StartItemBody,
  ): Promise<StartItemResponse> {
    const {userId, courseId, courseVersionId} = params;
    const {itemId, moduleId, sectionId} = body;

    const watchItemId: string = await this.progressService.startItem(
      userId,
      courseId,
      courseVersionId,
      moduleId,
      sectionId,
      itemId,
    );

    return new StartItemResponse({
      watchItemId,
    });
  }

  @Post('/:userId/progress/courses/:courseId/versions/:courseVersionId/stop')
  @OnUndefined(200)
  async stopItem(
    @Params() params: StopItemParams,
    @Body() body: StopItemBody,
  ): Promise<void> {
    const {userId, courseId, courseVersionId} = params;
    const {itemId, sectionId, moduleId, watchItemId} = body;

    await this.progressService.stopItem(
      userId,
      courseId,
      courseVersionId,
      itemId,
      sectionId,
      moduleId,
      watchItemId,
    );
  }

  @Patch('/:userId/progress/courses/:courseId/versions/:courseVersionId/update')
  @OnUndefined(200)
  async updateProgress(
    @Params() params: UpdateProgressParams,
    @Body() body: UpdateProgressBody,
  ): Promise<void> {
    const {userId, courseId, courseVersionId} = params;
    const {itemId, moduleId, sectionId, watchItemId} = body;

    await this.progressService.updateProgress(
      userId,
      courseId,
      courseVersionId,
      moduleId,
      sectionId,
      itemId,
      watchItemId,
    );
  }

  @Authorized(['admin'])
  @Post(
    '/:userId/progress/reset/courses/:courseId/versions/:courseVersionId/modules/:moduleId/sections/:sectionId/items/:itemId',
  )
  @HttpCode(200)
  async resetItemProgress(@Params() params: ResetItemProgressParams) {
    const {userId, courseId, courseVersionId, moduleId, sectionId, itemId} =
      params;

    const resetProgressResponse = await this.progressService.resetProgress(
      userId,
      courseId,
      courseVersionId,
      moduleId,
      sectionId,
      itemId,
    );
    if (!resetProgressResponse) {
      throw new InternalServerError('Failed to reset progress');
    }

    return resetProgressResponse;
  }
}
export {ProgressController};
