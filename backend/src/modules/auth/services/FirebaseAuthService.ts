/**
 * @file FirebaseAuthService.ts
 * @description Firebase authentication service implementation.
 *
 * @category Auth/Services
 * @categoryDescription
 * Service implementing authentication logic using Firebase.
 * Handles user creation, token verification, and password updates.
 */

import 'reflect-metadata';
import {Auth} from 'firebase-admin/lib/auth/auth';
import {Inject, Service} from 'typedi';
import admin from 'firebase-admin';
import {UserRecord} from 'firebase-admin/lib/auth/user-record';
import {applicationDefault} from 'firebase-admin/app';
import {
  IInvite,
  IUser,
  IEnrollment,
  statusType,
  actionType,
} from 'shared/interfaces/Models';
import {IInviteRepository, IUserRepository} from 'shared/database';
import {IAuthService} from '../interfaces/IAuthService.js';
import {ChangePasswordBody, SignUpBody} from '../classes/validators/index.js';
import {ReadConcern, ReadPreference, WriteConcern} from 'mongodb';
import {CreateError} from 'shared/errors/errors';
import {UserRepository} from 'shared/database/providers/mongo/repositories/UserRepository';
import {EnrollmentRepository} from 'shared/database/providers/mongo/repositories/EnrollmentRepository';
import {IUserRepository as IUserRepo} from 'shared/database/interfaces/IUserRepository';
import {STATUS_CODES} from 'http';
import {MailService} from 'modules/notifications/services';

/**
 * Custom error thrown during password change operations.
 *
 * @category Auth/Errors
 */
export class ChangePasswordError extends Error {
  /**
   * Creates a new ChangePasswordError instance.
   *
   * @param message - The error message describing what went wrong
   */
  constructor(message: string) {
    super(message);
    this.name = 'ChangePasswordError';
  }
}

@injectable()
export class FirebaseAuthService extends BaseService implements IAuthService {
  private auth: any;
  constructor(
    @Inject('EnrollmentRepository')
    private enrollmentRepository: EnrollmentRepository,
    @Inject('UserRepository') private userRepository: IUserRepository,
    @Inject('InviteRepository') private inviteRepository: IInviteRepository,
    @Inject('MailService')
    private readonly mailService: MailService,
  ) {
    super(database);
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    this.auth = admin.auth();
  }

  async verifyToken(token: string): Promise<Partial<IUser>> {
    // Decode and verify the Firebase token
    // const decodedToken = await this.auth.verifyIdToken(token);
    // // Retrieve the full user record from Firebase
    // const userRecord = await this.auth.getUser(decodedToken.uid);

    // // Map Firebase user data to our application user model
    // const user: Partial<IUser> = {
    //   firebaseUID: userRecord.uid,
    //   email: userRecord.email || '',
    //   firstName: userRecord.displayName?.split(' ')[0] || '',
    //   lastName: userRecord.displayName?.split(' ')[1] || '',
    // };
    // console.log('Decoded user:', user);

    const result = await this.userRepository.findByFirebaseUID(token);

    return result;
  }

  async signup(body: SignUpBody): Promise<string> {
    let userRecord: any;
    try {
      // Create the user in Firebase Auth
      userRecord = await this.auth.createUser({
        email: body.email,
        emailVerified: false,
        password: body.password,
        displayName: `${body.firstName} ${body.lastName}`,
        disabled: false,
      });
    } catch (error) {
      throw new InternalServerError('Failed to create user in Firebase');
    }

    // Prepare user object for storage in our database
    const user: Partial<IUser> = {
      firebaseUID: userRecord.uid,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      //roles: body.roles || ['student'], // Default to 'student' if no roles provided
      roles: ['student'],
    };

    let createdUser: IUser;
    const session = (await this.userRepository.getDBClient()).startSession();
    try {
      await session.startTransaction(this.transactionOptions);
      // Store the user in our application database
      createdUser = await this.userRepository.create(user, session);
      if (!createdUser) {
        throw new CreateError('Failed to create the user');
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new Error('Failed to create user in the repository');
    } finally {
      await session.endSession();
    }
    // console.log('User created:', createdUser);
    // console.log(user);
    const invites = [];
    invites.push(await this.inviteRepository.findInviteByEmail(body.email));
    console.log('Invites found:', invites);
    for (const invite of invites) {
      if (invite.status === statusType.PENDING) {
        const isAlreadyEnrolled =
          await this.enrollmentRepository.findEnrollment(
            createdUser.id,
            invite.courseId,
            invite.courseVersionId,
          );
        console.log('Is already enrolled:', isAlreadyEnrolled);

        if (!isAlreadyEnrolled) {
          // Enroll the user
          await this.enrollmentRepository.createEnrollment({
            userId: createdUser.id,
            courseId: invite.courseId,
            courseVersionId: invite.courseVersionId,
            status: 'active',
            enrollmentDate: new Date(),
          });

          // Update invite object
          invite.action = actionType.NOTIFY;
          invite.status = statusType.ACCEPTED;
          invite.updatedAt = new Date(); // optional

          // Save the modified invite back to DB
          await this.inviteRepository.updateInvite(invite);
          await this.mailService.sendMail(invite);
        }
      }
    }

    await this._withTransaction(async session => {
      const newUser = new User(user);
      createdUserId = await this.userRepository.create(newUser, session);
      if (!createdUserId) {
        throw new InternalServerError('Failed to create the user');
      }
    });
    return createdUserId;
  }

  async changePassword(
    body: ChangePasswordBody,
    requestUser: IUser,
  ): Promise<{success: boolean; message: string}> {
    // Verify user exists in Firebase
    const firebaseUser = await this.auth.getUser(requestUser.firebaseUID);
    if (!firebaseUser) {
      throw new ChangePasswordError('User not found');
    }

    // Check password confirmation
    if (body.newPassword !== body.newPasswordConfirm) {
      throw new ChangePasswordError('New passwords do not match');
    }

    // Update password in Firebase Auth
    await this.auth.updateUser(firebaseUser.uid, {
      password: body.newPassword,
    });

    return {success: true, message: 'Password updated successfully'};
  }
}
