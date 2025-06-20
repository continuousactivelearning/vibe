import {JsonController, Post, HttpCode, Body, CurrentUser, Authorized, createParamDecorator, Action, Req} from 'routing-controllers';
import { injectable } from 'inversify';
import { AuthenticatedUser, AuthenticatedUserEnrollements, IEnrollment, IUser } from '#root/shared/interfaces/models.js';
import { re } from 'mathjs';
import { AuthenticatedRequest } from '#root/shared/index.js';
import { getFromContainer } from 'routing-controllers';
import { FirebaseAuthService } from '#root/modules/auth/services/FirebaseAuthService.js';
import { auth } from 'firebase-admin';
import { EnrollmentService } from '#root/modules/users/services/EnrollmentService.js';
import { EnrollmentActions } from '../authorization.js';
import { subject } from '@casl/ability';

function UserAbility(){
  return createParamDecorator({
    required: true,
    value: async (action: Action, value?: any): Promise<AuthenticatedUser> => {
      console.log(globalThis)
      const rawUser = action.request.user as IUser;
      const enrollmentService = getFromContainer(EnrollmentService);
      const enrollments: IEnrollment[] = await enrollmentService.getEnrollments(rawUser._id.toString());
      //Convert enrollments to AuthenticatedUserEnrollements[]
      const enrollmentData: AuthenticatedUserEnrollements[] = enrollments.map((enrollment: IEnrollment) => {
        return {
          courseId: enrollment.courseId.toString(),
          versionId: enrollment.courseVersionId.toString(),
          role: enrollment.role
        };
      });

      const user: AuthenticatedUser = {
        userId: rawUser._id.toString(),
        globalRole: rawUser.roles[0] as 'admin' | 'user',
        enrollments: enrollmentData
      }

      if (!rawUser) {
        throw new Error('User not found in request');
      }
      return user;
    }
  });
}


@JsonController('/temp/temp')
@injectable()
export class TempController {
  constructor(
    
  ) {}

  @Post('/')
  @HttpCode(201)
  async create(@Body() body: any, @UserAbility() userAbility: AuthenticatedUser, @Req() request: AuthenticatedRequest) {
    return {
      userAbility,
      user: request.user,
    };
  }
}
