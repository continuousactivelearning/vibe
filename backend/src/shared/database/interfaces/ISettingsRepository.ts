import {UpdateResult} from 'mongodb';
import {
  ICourseSettings,
  ISettings,
  IUserSettings,
} from '../../interfaces/Models';

/**
 * Interface representing a repository for settings related operations.
 * This interface defined methods for creating, reading and managing course & user settings.
 */

// Enum representing the different components of proctoring that can be enabled or disabled.
export enum ProctoringComponent {
  CAMERAMICRO = 'cameraMic',
  BLUR = 'blur',
  FACEPOSE = 'facePose',
  HANDS = 'hands',
  KEYLOCK = 'keyLock',
  VOICE = 'voice',
  VIRTUALBACKGROUND = 'virtualBackground',
  RIGHTCLICKDISABLED = 'rightClickDisabled',
}

/**
 * Interface for the settings repository.
 * This interface defines methods for managing course and user settings.
 */
export interface ISettingsRepository {
  createCourseSettings(
    courseSettings: ICourseSettings,
  ): Promise<ICourseSettings | null>;

  readCourseSettings(
    courseId: string,
    courseVersionId: string,
  ): Promise<ICourseSettings | null>;

  addCourseProctoring(
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null>;

  removeCourseProctoring(
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null>;

  createUserSettings(
    userSettings: IUserSettings,
  ): Promise<IUserSettings | null>;

  readUserSettings(
    studentId: string,
    courseId: string,
    courseVersionId: string,
  ): Promise<IUserSettings | null>;

  addUserProctoring(
    studentId: string,
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null>;

  removeUserProctoring(
    studentId: string,
    courseId: string,
    courseVersionId: string,
    component: ProctoringComponent,
  ): Promise<UpdateResult | null>;
}
