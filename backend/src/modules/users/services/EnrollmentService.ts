import { COURSES_TYPES } from '#courses/types.js';
import { InviteStatus } from '#root/modules/notifications/index.js';
import { BaseService } from '#root/shared/classes/BaseService.js';
import { ICourseRepository } from '#root/shared/database/interfaces/ICourseRepository.js';
import { IItemRepository } from '#root/shared/database/interfaces/IItemRepository.js';
import { IUserRepository } from '#root/shared/database/interfaces/IUserRepository.js';
import { MongoDatabase } from '#root/shared/database/providers/mongo/MongoDatabase.js';
import {
  EnrollmentRole,
  ICourseVersion,
} from '#root/shared/interfaces/models.js';
import { GLOBAL_TYPES } from '#root/types.js';
import { EnrollmentRepository } from '#shared/database/providers/mongo/repositories/EnrollmentRepository.js';
import { Enrollment } from '#users/classes/transformers/Enrollment.js';
import { EnrollmentStats, USERS_TYPES } from '#users/types.js';
import { injectable, inject } from 'inversify';
import { ClientSession, ObjectId } from 'mongodb';
import { BadRequestError, NotFoundError } from 'routing-controllers';
import { ProgressService } from './ProgressService.js';
import { ProgressRepository } from '#root/shared/index.js';

@injectable()
export class EnrollmentService extends BaseService {
  constructor(
    @inject(USERS_TYPES.EnrollmentRepo)
    private readonly enrollmentRepo: EnrollmentRepository,
    @inject(GLOBAL_TYPES.CourseRepo)
    private readonly courseRepo: ICourseRepository,
    @inject(GLOBAL_TYPES.UserRepo) private readonly userRepo: IUserRepository,
    @inject(COURSES_TYPES.ItemRepo) private readonly itemRepo: IItemRepository,
    @inject(USERS_TYPES.ProgressService)
    private readonly progressService: ProgressService,
    @inject(USERS_TYPES.ProgressRepo)
    private readonly progressRepo: ProgressRepository,
    @inject(GLOBAL_TYPES.Database)
    private readonly database: MongoDatabase,
  ) {
    super(database);
  }

  async enrollUser(
    userId: string,
    courseId: string,
    courseVersionId: string,
    role: EnrollmentRole,
    throughInvite: boolean = false,
  ) {
    return this._withTransaction(async (session: ClientSession) => {
      const user = await this.userRepo.findById(userId);
      if (!user) throw new NotFoundError('User not found');

      const course = await this.courseRepo.read(courseId);
      if (!course) throw new NotFoundError('Course not found');

      const courseVersion = await this.courseRepo.readVersion(
        courseVersionId,
        session,
      );
      if (!courseVersion || courseVersion.courseId.toString() !== courseId) {
        throw new NotFoundError(
          'Course version not found or does not belong to this course',
        );
      }

      const existingEnrollment = await this.enrollmentRepo.findEnrollment(
        userId,
        courseId,
        courseVersionId,
      );

      // If the user is already enrolled and not enrolling through an invite, throw an error
      // This prevents duplicate enrollments unless it's through an invite
      if (existingEnrollment && !throughInvite) {
        throw new BadRequestError(
          'User is already enrolled in this course version',
        );
      }
      // If the user is already enrolled through an invite, we will skip the enrollment creation
      if (existingEnrollment && throughInvite) {
        let status: InviteStatus = 'ALREADY_ENROLLED';
        return status;
      }

      const enrollment = new Enrollment(userId, courseId, courseVersionId);

      const createdEnrollment = await this.enrollmentRepo.createEnrollment({
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId),
        courseVersionId: new ObjectId(courseVersionId),
        role: role,
        status: 'ACTIVE',
        enrollmentDate: new Date(),
        percentCompleted: 0,
      });

      const initialProgress = await this.initializeProgress(
        userId,
        courseId,
        courseVersionId,
        courseVersion,
        session,
      );

      return {
        enrollment: createdEnrollment,
        progress: initialProgress,
        role: role,
      };
    });
  }
  async findEnrollment(
    userId: string,
    courseId: string,
    courseVersionId: string,
  ) {
    return this._withTransaction(async (session: ClientSession) => {
      const user = await this.userRepo.findById(userId);
      if (!user) throw new NotFoundError('User not found');

      const course = await this.courseRepo.read(courseId);
      if (!course) throw new NotFoundError('Course not found');

      const courseVersion = await this.courseRepo.readVersion(
        courseVersionId,
        session,
      );
      if (!courseVersion || courseVersion.courseId.toString() !== courseId) {
        throw new NotFoundError(
          'Course version not found or does not belong to this course',
        );
      }
      const existingEnrollment = await this.enrollmentRepo.findEnrollment(
        userId,
        courseId,
        courseVersionId,
      );
      if (!existingEnrollment) {
        throw new Error('User is not enrolled in this course version');
      }

      return existingEnrollment;
    });
  }
  async unenrollUser(
    userId: string,
    courseId: string,
    courseVersionId: string,
  ) {
    return this._withTransaction(async (session: ClientSession) => {
      const enrollment = await this.enrollmentRepo.findEnrollment(
        userId,
        courseId,
        courseVersionId,
      );
      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      // Remove enrollment
      await this.enrollmentRepo.deleteEnrollment(
        userId,
        courseId,
        courseVersionId,
        session,
      );

      // Remove progress
      await this.enrollmentRepo.deleteProgress(
        userId,
        courseId,
        courseVersionId,
        session,
      );

      return {
        enrollment: null,
        progress: null,
        role: enrollment.role,
      };
    });
  }

  async getEnrollments(userId: string, skip: number, limit: number) {
    return this._withTransaction(async (session: ClientSession) => {
      const result = await this.enrollmentRepo.getEnrollments(
        userId,
        skip,
        limit,
      );
      return result.map(enrollment => {
        const { userId, ...rest } = enrollment;
        return {
          ...rest,
          _id: enrollment._id.toString(),
          courseId: enrollment.courseId.toString(),
          courseVersionId: enrollment.courseVersionId.toString(),
        };
      });
    });
  }

  async getAllEnrollments(userId: string) {
    return this._withTransaction(async (session: ClientSession) => {
      const result = await this.enrollmentRepo.getAllEnrollments(
        userId,
        session,
      );
      return result.map(enrollment => ({
        ...enrollment,
        _id: enrollment._id.toString(),
        courseId: enrollment.courseId.toString(),
        courseVersionId: enrollment.courseVersionId.toString(),
      }));
    });
  }

  async getCourseVersionEnrollments(
    courseId: string,
    courseVersionId: string,
    skip: number,
    limit: number,
    search: string,
    sortBy: 'name' | 'enrollmentDate' | 'progress',
    sortOrder: 'asc' | 'desc',
  ) {
    return this._withTransaction(async (session: ClientSession) => {
      const courseVersion = await this.courseRepo.readVersion(
        courseVersionId,
        session,
      );
      if (!courseVersion || courseVersion.courseId.toString() !== courseId) {
        throw new NotFoundError(
          'Course version not found or does not belong to this course',
        );
      }

      const result = await this.enrollmentRepo.getCourseVersionEnrollments(
        courseId,
        courseVersionId,
        skip,
        limit,
        search,
        sortBy,
        sortOrder,
      );
      
      const enrollments = result.enrollments;
      
      const totalItems = await this.itemRepo.getTotalItemsCount(courseId, courseVersionId, session);
      
      // Create enriched enrollments with progress data
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            // Get completed items count for display
            const completedItemsCount = await this.progressService.getUserProgressPercentageWithoutTotal(
              enrollment.userId, 
              courseId, 
              courseVersionId
            );
            
            return {
              role: enrollment.role,
              status: enrollment.status,
              enrollmentDate: enrollment.enrollmentDate,
              user: {
                userId: enrollment.userId,
                firstName: enrollment.firstName,
                lastName: enrollment.lastName,
                email: enrollment.email,
              },
              progress: {
                completedItems: completedItemsCount,
                totalItems,
                percentCompleted: enrollment.percentCompleted || 0,
              }
            };
          } catch (error) {
            console.log(enrollment.userId, error);
            return null;
          }
        })
      );

      const filteredEnrollments = enrichedEnrollments.filter(enrollment => enrollment !== null);
      
      return {
        enrollments: filteredEnrollments,
        totalDocuments: result.totalDocuments,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };
    });
  }

  async countEnrollments(userId: string) {
    return this._withTransaction(async (session: ClientSession) => {
      const result = await this.enrollmentRepo.countEnrollments(userId);
      return result;
    });
  }

  async getCourseVersionEnrollmentStatistics(
    courseId: string,
    courseVersionId: string,
  ) {
    return this._withTransaction(async (session: ClientSession) => {
      const courseVersion = await this.courseRepo.readVersion(
        courseVersionId,
        session,
      );
      if (!courseVersion || courseVersion.courseId.toString() !== courseId) {
        throw new NotFoundError(
          'Course version not found or does not belong to this course',
        );
      }

      const stats = await this.enrollmentRepo.getVersionEnrollmentStats(
        courseId,
        courseVersionId,
        session,
      );

      return stats;
    });
  }

  /**
   * Initialize student progress tracking to the first item in the course.
   * Private helper method for the enrollment process.
   */
  private async initializeProgress(
    userId: string,
    courseId: string,
    courseVersionId: string,
    courseVersion: ICourseVersion,
    session: ClientSession,
  ) {
    // Get the first module, section, and item
    if (!courseVersion.modules || courseVersion.modules.length === 0) {
      return null; // No modules to track progress for
    }

    const firstModule = courseVersion.modules.sort((a, b) =>
      a.order.localeCompare(b.order),
    )[0];

    if (!firstModule.sections || firstModule.sections.length === 0) {
      return null; // No sections to track progress for
    }

    const firstSection = firstModule.sections.sort((a, b) =>
      a.order.localeCompare(b.order),
    )[0];

    // Get the first item from the itemsGroup
    const itemsGroup = await this.itemRepo.readItemsGroup(
      firstSection.itemsGroupId.toString(),
      session,
    );

    if (!itemsGroup || !itemsGroup.items || itemsGroup.items.length === 0) {
      return null; // No items to track progress for
    }

    const firstItem = itemsGroup.items.sort((a, b) =>
      a.order.localeCompare(b.order),
    )[0];

    // Create progress record
    return await this.enrollmentRepo.createProgress({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      courseVersionId: new ObjectId(courseVersionId),
      currentModule: firstModule.moduleId,
      currentSection: firstSection.sectionId,
      currentItem: firstItem._id,
      completed: false,
    });
  }

  // async bulkUpdateAllEnrollments(): Promise<void> {
  //   return this._withTransaction(async session => {
  //     const courses = await this.courseRepo.getAllCourses(session);
  //     const courseVersionIds = courses.flatMap(course => course.versions);

  //     const bulkOperations = [];

  //     for (const courseVersionId of courseVersionIds) {
  //       try {
  //         const courseVersion = await this.courseRepo.readVersion(
  //           courseVersionId as string,
  //           session,
  //         );
  //         if (!courseVersion) continue;

  //         // total items for this version
  //         // const totalItems = await this.itemRepo.CalculateTotalItemsCount(
  //         //   courseVersion.courseId.toString(),
  //         //   courseVersion._id.toString(),
  //         //   session,
  //         // );

  //         // get all enrollments for this course version
  //         const enrollments = await this.enrollmentRepo.getByCourseVersion(
  //           courseVersion.courseId.toString(),
  //           courseVersion._id.toString(),
  //           session,
  //         );

  //         for (const enrollment of enrollments) {
  //           try {
  //             // const completedItems =
  //             //   await this.progressService.getUserProgressPercentageWithoutTotal(
  //             //     enrollment.userId.toString(),
  //             //     courseVersion.courseId.toString(),
  //             //     courseVersion._id.toString(),
  //             //   );

  //             // const percentCompleted = Math.round(
  //             //   (totalItems > 0 ? completedItems / totalItems : 0) * 100,
  //             // );
  //             bulkOperations.push({
  //               updateOne: {
  //                 filter: { _id: new ObjectId(enrollment._id) },
  //                 update: {
  //                   $set: {
  //                     // percentCompleted
  //                     userId: enrollment.userId instanceof ObjectId ? enrollment.userId : new ObjectId(enrollment.userId)
  //                   },
  //                 },
  //               },
  //             });
  //           } catch (err) {
  //             console.error(
  //               `Failed to compute progress for enrollment ${enrollment._id}`,
  //               err,
  //             );
  //           }
  //         }
  //       } catch (error) {
  //         console.error(
  //           `Failed to process course version: ${courseVersionId}`,
  //           error,
  //         );
  //       }
  //     }

  //     if (bulkOperations.length > 0) {
  //       await this.enrollmentRepo.bulkUpdateEnrollments(
  //         bulkOperations,
  //         session,
  //       );
  //       console.log(`Bulk updated ${bulkOperations.length} enrollments`);
  //     }
  //   });
  // }




  async bulkUpdateAllEnrollments(): Promise<void> {
    const BATCH_SIZE = 10;
    const courses = await this.courseRepo.getAllCourses();
    const courseVersionIds = courses.flatMap(course => course.versions);

    const bulkOperations = [];
    let batchCount = 0;

    for (const courseVersionId of courseVersionIds) {
      try {
        const courseVersion = await this.courseRepo.readVersion(courseVersionId as string);
        if (!courseVersion) continue;

        const totalItems = await this.itemRepo.CalculateTotalItemsCount(
          courseVersion.courseId.toString(),
          courseVersion._id.toString(),
        );

        const enrollments = await this.enrollmentRepo.getByCourseVersion(
          courseVersion.courseId.toString(),
          courseVersion._id.toString(),
        );

        for (const enrollment of enrollments) {
          try {
            const completedItems = await this.progressService.getUserProgressPercentageWithoutTotal(
              enrollment.userId.toString(),
              courseVersion.courseId.toString(),
              courseVersion._id.toString(),
            );

            const percentCompleted = Math.round(
              (totalItems > 0 ? completedItems / totalItems : 0) * 100,
            );

            // const normalizedUserId =
            //   enrollment.userId instanceof ObjectId
            //     ? enrollment.userId
            //     : new ObjectId(enrollment.userId);

            bulkOperations.push({
              updateOne: {
                filter: { _id: new ObjectId(enrollment._id) },
                update: {
                  $set: {
                    percentCompleted,
                    // userId: normalizedUserId,
                  },
                },
              },
            });

            if (bulkOperations.length === BATCH_SIZE) {
              await this._withTransaction(async session => {
                await this.enrollmentRepo.bulkUpdateEnrollments(bulkOperations, session);
                console.log(`✅ Batch ${++batchCount}: Updated ${bulkOperations.length} enrollments`);
                bulkOperations.length = 0; // Clear the array
              });
            }
          } catch (err) {
            console.error(`Failed to process enrollment ${enrollment._id}`, err);
          }
        }
      } catch (err) {
        console.error(`Failed to process course version ${courseVersionId}`, err);
      }
    }

    // Process any remaining operations
    if (bulkOperations.length > 0) {
      await this._withTransaction(async session => {
        await this.enrollmentRepo.bulkUpdateEnrollments(bulkOperations, session);
        console.log(`✅ Final batch: Updated ${bulkOperations.length} enrollments`);
      });
    }
  }


  async updatePercentCompleted(
    userId: string,
    courseId: string,
    courseVersionId: string,
    percentCompleted: number,
    session?: ClientSession,
  ): Promise<void> {
    await this.enrollmentRepo.updatePercentCompleted(
      userId,
      courseId,
      courseVersionId,
      percentCompleted,
      session,
    );
  }

  async getPercentCompleted(
    userId: string,
    courseId: string,
    courseVersionId: string,
  ): Promise<number> {
    return await this.enrollmentRepo.getPercentCompleted(
      userId,
      courseId,
      courseVersionId,
    );
  }

  async calculateAndUpdatePercentCompleted(
    userId: string,
    courseId: string,
    courseVersionId: string,
    session?: ClientSession,
  ): Promise<number> {
    const completedItemsCount = await this.progressService.getUserProgressPercentageWithoutTotal(
      userId,
      courseId,
      courseVersionId,
    );

    const totalItems = await this.itemRepo.getTotalItemsCount(
      courseId,
      courseVersionId,
      session,
    );

    const percentCompleted = totalItems > 0 ? completedItemsCount / totalItems : 0;

    await this.updatePercentCompleted(
      userId,
      courseId,
      courseVersionId,
      percentCompleted,
      session,
    );

    return percentCompleted;
  }
}

