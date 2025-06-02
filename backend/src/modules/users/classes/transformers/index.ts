import {Expose, Type} from 'class-transformer';
import {Enrollment} from './Enrollment';
import {Progress} from './Progress';
import {Token} from 'typedi';

export * from './Enrollment';
export * from './Progress';

@Expose({toPlainOnly: true})
export class EnrollUserResponse {
  @Expose()
  @Type(() => Enrollment)
  enrollment: Enrollment;

  @Expose()
  @Type(() => Progress)
  progress: Progress;

  @Expose()
  @Type(() => String)
  role: 'instructor' | 'student';

  constructor(
    enrollment: Enrollment,
    progress: Progress,
    role: 'instructor' | 'student',
  ) {
    this.enrollment = enrollment;
    this.progress = progress;
    this.role = role;
  }
}
export class EnrolledUserResponse {
  @Expose()
  @Type(() => String)
  role: 'instructor' | 'student';

  @Expose()
  @Type(() => String)
  status: 'active' | 'inactive';

  @Expose()
  @Type(() => Date)
  enrollmentDate: Date;

  constructor(
    role: 'instructor' | 'student',
    status: 'active' | 'inactive',
    enrollmentDate: Date,
  ) {
    this.role = role;
    this.status = status;
    this.enrollmentDate = enrollmentDate;
  }
}
