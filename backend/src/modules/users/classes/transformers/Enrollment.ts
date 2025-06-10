import {
  IEnrollment,
  ObjectIdToString,
  StringToObjectId,
  ID,
  EnrollmentRole,
  EnrollmentStatus,
} from '#shared/index.js';
import {Expose, Transform, Type} from 'class-transformer';
import {ObjectId} from 'mongodb';

@Expose()
export class Enrollment implements IEnrollment {
  @Expose({toClassOnly: true})
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  userId: ID;

  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  courseId: ID;

  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  courseVersionId: ID;

  @Expose()
  role: EnrollmentRole;

  @Expose()
  status: EnrollmentStatus;

  @Expose()
  @Type(() => Date)
  enrollmentDate: Date;

  constructor(userId?: string, courseId?: string, courseVersionId?: string) {
    if (userId && courseId && courseVersionId) {
      this.userId = new ObjectId(userId);
      this.courseId = new ObjectId(courseId);
      this.courseVersionId = new ObjectId(courseVersionId);
      this.status = 'active';
      this.enrollmentDate = new Date();
    }
  }
}
