import 'reflect-metadata';
import {IsEmpty, IsNotEmpty, IsString, IsMongoId} from 'class-validator';
import {ICourse, ICourseVersion, IModule} from 'shared/interfaces/Models';
import {JSONSchema} from 'class-validator-jsonschema';
import {ObjectId} from 'mongodb';
import {ID} from 'shared/types';

/**
 * DTO for creating a new course version.
 *
 * @category Courses/Validators/CourseVersionValidators
 */
class CreateCourseVersionBody implements Partial<ICourseVersion> {
  /**
   * ID of the course this version belongs to.
   * This is auto-populated and should remain empty in the request body.
   */
  @IsEmpty()
  courseId?: string;

  /**
   * The version label or identifier (e.g., "v1.0", "Fall 2025").
   */
  @IsNotEmpty()
  @IsString()
  version: string;

  /**
   * A brief description of the course version.
   */
  @IsNotEmpty()
  @IsString()
  description: string;
}

/**
 * Route parameters for creating a course version under a specific course.
 *
 * @category Courses/Validators/CourseVersionValidators
 */
class CreateCourseVersionParams {
  /**
   * ID of the course to attach the new version to.
   */
  @IsMongoId()
  @IsString()
  id: string;
}

/**
 * Route parameters for reading a course version by ID.
 *
 * @category Courses/Validators/CourseVersionValidators
 */
class ReadCourseVersionParams {
  /**
   * ID of the course version to retrieve.
   */
  @IsMongoId()
  @IsString()
  id: string;
}

/**
 * Route parameters for deleting a course version by ID.
 *
 * @category Courses/Validators/CourseVersionValidators
 */

class DeleteCourseVersionParams {
  /**
   * ID of the course version to delete.
   */
  @IsMongoId()
  @IsString()
  versionId: string;

  @IsMongoId()
  @IsString()
  courseId: string;
}

class CourseVersionDataResponse implements ICourseVersion {
  @JSONSchema({
    description: 'Unique identifier for the courseVersion',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
    format: 'Mongo Object ID',
    readOnly: true,
  })
  @IsNotEmpty()
  _id?: ID;

  @JSONSchema({
    description: 'ID of the course this version belongs to',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
    format: 'Mongo Object ID',
  })
  @IsNotEmpty()
  courseId: ID;

  @JSONSchema({
    description: 'Version label or identifier',
    example: 'v1.0',
    type: 'string',
  })
  @IsNotEmpty()
  version: string;

  @JSONSchema({
    description: 'Description of the courseVersion',
    example: 'This course covers the basics of JAVA programming.',
    type: 'string',
  })
  @IsNotEmpty()
  description: string;

  @JSONSchema({
    description: 'List of modules in the course version',
    type: 'array',
    items: {
      $ref: '#/components/schemas/IModule',
    },
  })
  modules: IModule[];

  @JSONSchema({
    title: 'CourseVersion Created At',
    description: 'Timestamp when the courseVersion was created',
    example: '2023-10-01T12:00:00Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  @IsNotEmpty()
  createdAt: Date | null;

  @JSONSchema({
    title: 'CourseVersion Updated At',
    description: 'Timestamp when the courseVersion was last updated',
    example: '2023-10-01T12:00:00Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  @IsNotEmpty()
  updatedAt: Date | null;
}

class CourseVersionNotFoundErrorResponse {
  @JSONSchema({
    description: 'The error message.',
    example:
      'No course Version found with the specified ID. Please verify the ID and try again.',
    type: 'string',
    readOnly: true,
  })
  @IsNotEmpty()
  message: string;
}

export {
  CreateCourseVersionBody,
  CreateCourseVersionParams,
  ReadCourseVersionParams,
  DeleteCourseVersionParams,
  CourseVersionDataResponse,
  CourseVersionNotFoundErrorResponse,
};
