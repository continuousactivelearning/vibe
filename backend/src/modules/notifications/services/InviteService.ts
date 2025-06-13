import 'reflect-metadata';
import {Body, NotFoundError} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {EnrollmentRepository} from 'shared/database/providers/mongo/repositories/EnrollmentRepository';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {UserRepository} from 'shared/database/providers/mongo/repositories/UserRepository';
import {InviteRepository} from 'shared/database/providers/MongoDatabaseProvider';
import {InviteBody} from '../classes/validators/index.js';
import {MailService} from './MailService.js';
import {SignUpBody} from 'modules/auth/classes/validators';
import {Invite} from '../classes/transformers/Invite.js';
import crypto from 'crypto';
import {actionType, statusType} from 'shared/interfaces/Models';
import {plainToClass, instanceToPlain} from 'class-transformer';
import {IEnrollment} from 'shared/interfaces/Models';

@Service()
export class InviteService {
  constructor(
    @Inject('InviteRepo') private readonly inviteRepo: InviteRepository,
    @Inject('UserRepo') private readonly userRepo: UserRepository,
    @Inject('CourseRepo') private readonly courseRepo: CourseRepository,
    @Inject('EnrollmentRepo')
    private readonly enrollmentRepo: EnrollmentRepository,
    @Inject()
    private readonly mailService: MailService,
  ) {}
  /**
   * Invites multiple users to a specific version of a course.
   *
   * @param emails - List of user emails to invite.
   * @param courseId - The ID of the course.
   * @param courseVersionId - The ID of the course version.
   * @returns A promise that resolves to an array of results for each email.
   */
  async inviteUserToCourse(
    emails: string[],
    courseId: string,
    courseVersionId: string,
  ) {
    const results = [];

    for (const email of emails) {
      console.log(
        'Inviting user:',
        email,
        'to course:',
        courseId,
        'version:',
        courseVersionId,
      );
      const inviteObject = plainToClass(Invite, {
        email: email,
        courseId: '665f3e5079e3c3a1e8412b3f', // Must be a valid MongoDB ObjectId string
        courseVersionId: '665f3e5079e3c3a1e8412b40',
        token: 'secure-random-token-abc123',
        action: actionType.SIGNUP, // enum usage
        status: statusType.PENDING, // enum usage
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      const user = await this.userRepo.findByEmail(inviteObject.email);
      inviteObject.email = email;
      inviteObject.courseId = courseId;
      inviteObject.courseVersionId = courseVersionId;
      if (!user) {
        inviteObject.action = actionType.SIGNUP;
        inviteObject.status = statusType.PENDING;
      } else {
        const enrollment = await this.enrollmentRepo.findEnrollment(
          user.id,
          inviteObject.courseId,
          inviteObject.courseVersionId,
        );
        if (enrollment) {
          inviteObject.action = actionType.NOTIFY;
          inviteObject.status = statusType.ACCEPTED;
        } else {
          inviteObject.action = actionType.ENROLL;
          inviteObject.status = statusType.PENDING;
        }
      }
      inviteObject.token = crypto.randomBytes(32).toString('hex');
      //console.log('Token Created !', inviteObject.token);
      const invitePlain = instanceToPlain(inviteObject);
      try {
        const result = await this.inviteRepo.create(invitePlain);
        console.log('✅  invite stored with _id:', result);
      } catch (error) {
        console.error('❌ Error storing invite:', error);
        throw error;
      }
      results.push(await this.mailService.sendMail(inviteObject));
    }
    return results;
  }

  async storeInvite() {
    const dummyInvite = plainToClass(Invite, {
      email: 'testuser@example.com',
      courseId: '665f3e5079e3c3a1e8412b3f',
      courseVersionId: '665f3e5079e3c3a1e8412b40',
      token: this.generateToken(),
      action: actionType.SIGNUP,
      status: statusType.PENDING,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitePlain = instanceToPlain(dummyInvite);

    try {
      const result = await this.inviteRepo.create(invitePlain);
      console.log('✅ Dummy invite stored with _id:', result);
      return result;
    } catch (error) {
      console.error('❌ Error storing dummy invite:', error);
      throw error;
    }
  }

  // async processInvite(token: string): Promise<string> {
  //   // Your business logic here
  //   const invite = await this.inviteRepo.findInviteByToken(token);

  //   return 'Invite processed successfully';
  // }

  async processInvite(token: string): Promise<any> {
    const invite = await this.inviteRepo.findInviteByToken(token);

    // Step 1: Validate invite
    if (!invite || invite.status !== statusType.PENDING) {
      throw new NotFoundError('Invalid or expired invite');
    }

    // Step 2: If SIGNUP → tell user to sign up first
    if (invite.action === actionType.SIGNUP) {
      return {
        statusCode: 400,
        error: 'signup_required',
        message: 'Please sign up at POST auth/signup to claim your invite',
        email: invite.email,
      };
    }

    // Step 3: Must be an existing user
    const user = await this.userRepo.findByEmail(invite.email);
    if (!user) {
      return {
        statusCode: 400,
        error: 'no_account',
        message: 'Register first at auth/signup',
      };
    }

    // Step 4: Check if already enrolled
    const alreadyEnrolled = await this.enrollmentRepo.findEnrollment(
      user.id,
      invite.courseId,
      invite.courseVersionId,
    );

    // Step 5: Enroll if ENROLL action and not already enrolled
    if (invite.action === actionType.ENROLL && !alreadyEnrolled) {
      const enrollment: IEnrollment = {
        userId: user.id,
        courseId: invite.courseId,
        courseVersionId: invite.courseVersionId,
        status: 'active',
        enrollmentDate: new Date(),
      };
      await this.enrollmentRepo.createEnrollment(enrollment);
      // Step 6: Mark invite as accepted
      invite.status = statusType.ACCEPTED;
      invite.action = actionType.NOTIFY; // Change action to NOTIFY after enrollment
      await this.inviteRepo.updateInvite(invite);
      // Send notification email
      await this.mailService.sendMail(invite);
    }

    // Step 7: Return appropriate response
    if (invite.action === actionType.NOTIFY && alreadyEnrolled) {
      return {
        status: 'already_enrolled',
        courseId: invite.courseId,
        courseVersionId: invite.courseVersionId,
      };
    }

    return {
      status: 'enrolled',
      courseId: invite.courseId,
      courseVersionId: invite.courseVersionId,
    };
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
