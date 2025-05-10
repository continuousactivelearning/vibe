import 'reflect-metadata';
import {NotFoundError} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {EnrollmentRepository} from 'shared/database/providers/mongo/repositories/EnrollmentRepository';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {UserRepository} from 'shared/database/providers/mongo/repositories/UserRepository';
import {Enrollment} from '../classes/transformers/Enrollment';
import {ObjectId} from 'mongodb';
import {ICourseVersion} from 'shared/interfaces/Models';

@Service()
export class EnrollmentService {
  constructor(
    @Inject('EnrollmentRepo')
    private readonly enrollmentRepo: EnrollmentRepository,
    @Inject('CourseRepo') private readonly courseRepo: CourseRepository,
    @Inject('UserRepo') private readonly userRepo: UserRepository,
  ) {}

  async enrollUser(userId: string, courseId: string, courseVersionId: string) {
    // Check if user, course, and courseVersion exist
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if course exists
    const course = await this.courseRepo.read(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if course version exists and belongs to the course
    const courseVersion = await this.courseRepo.readVersion(courseVersionId);
    if (!courseVersion || courseVersion.courseId.toString() !== courseId) {
      throw new NotFoundError(
        'Course version not found or does not belong to this course',
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentRepo.findEnrollment(
      userId,
      courseId,
      courseVersionId,
    );

    if (existingEnrollment) {
      throw new Error('User is already enrolled in this course version');
    }

    // Create enrollment record
    const enrollment = new Enrollment(userId, courseId, courseVersionId);
    const createdEnrollment = await this.enrollmentRepo.createEnrollment({
      userId: userId,
      courseId: new ObjectId(courseId),
      courseVersionId: new ObjectId(courseVersionId),
      status: 'active',
      enrollmentDate: new Date(),
    });

    // Initialize progress to first module, section, and item
    const initialProgress = await this.initializeProgress(
      userId,
      courseId,
      courseVersionId,
      courseVersion,
    );

    return {
      enrollment: createdEnrollment,
      progress: initialProgress,
    };
  }

  /**
   * Initialize student progress tracking to the first item in the course.
   * Private helper method for the enrollment process.
   */
  private async initializeProgress(
    userId: string,
    courseId: string,
    courseVersionId: string,
    courseVersion: ICourseVersion, // Replace with the actual type of courseVersion
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
    const itemsGroup = await this.courseRepo.readItemsGroup(
      firstSection.itemsGroupId.toString(),
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
      currentItem: firstItem.itemId,
      completed: false,
    });
  }

  /**
   * Reset student progress to the given item id in the course.
   */
  async resetProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    sectionId: string,
    itemId: string,
  ) {
    // Check if user, course, and courseVersion exist
    const user = await this.userRepo.findByFirebaseUID(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if course exists
    const course = await this.courseRepo.read(courseId);
    if (!course) {
      throw new NotFoundError(
        'The specified course Not found. Please check the CourseId.',
      );
    }

    // Check if module exists
    const module = await this.courseRepo.read(moduleId);
    if (!module) {
      throw new NotFoundError(
        'The specified module does not exist in the course. Please check the moduleId.',
      );
    }

    // Check if section exists
    const section = await this.courseRepo.read(sectionId);
    if (!section) {
      throw new NotFoundError(
        'The specified section does not exist in the given module. Please check the sectionId.',
      );
    }

    // Check if item exists
    const item = await this.courseRepo.read(itemId);
    if (!item) {
      throw new NotFoundError(
        'The specified item does not exist in the given section. Please check the itemId.',
      );
    }

    // Reset Progress Record
    const resetProgress = await this.enrollmentRepo.resetItemProgress(
      userId,
      courseId,
      moduleId,
      sectionId,
      itemId,
    );

    return resetProgress;
  }
}
