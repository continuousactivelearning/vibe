import 'reflect-metadata';
import {
  IsFirebasePushId,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

/**
 * Route parameters for enrolling a student in a course version.
 *
 * @category Users/Validators/EnrollmentValidators
 */
export class EnrollmentParams {
  /**
   * User ID of the student to enroll
   */

  @IsString()
  @IsNotEmpty()
  userId: string;

  /**
   * ID of the course to enroll in
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  courseId: string;

  /**
   * ID of the specific course version to enroll in
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
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
