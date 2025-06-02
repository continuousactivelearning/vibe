import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  MongoAbility,
} from '@casl/ability';
import {IUser} from './interfaces/Models';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Modules =
  | 'courses'
  | 'module'
  | 'users'
  | 'quizzes'
  | 'auth'
  | 'all';

// Allow object subjects for field-based checks
type ModuleSubject = {courseVersionId: string} | Modules;
export type AppAbility = MongoAbility<[Actions, ModuleSubject]>;

export type AbilityContext = {
  enrollmentRole?: string;
  courseVersionId?: string;
};

export async function defineAbilitiesFor(
  user: IUser,
  context?: AbilityContext,
): Promise<AppAbility> {
  const {can, cannot, build} = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  if (user.roles.includes('admin')) {
    can('manage', 'all');
    return build();
  }

  // Require courseVersionId for contextual rules
  if (context?.enrollmentRole === 'instructor') {
    if (!context.courseVersionId) {
      throw new Error(
        'courseVersionId is required for instructor authorization',
      );
    }
    can(['create', 'update', 'delete'], 'module', {
      courseVersionId: context.courseVersionId,
    });
  } else if (context?.enrollmentRole === 'student') {
    if (!context.courseVersionId) {
      throw new Error('courseVersionId is required for student authorization');
    }
    can('read', 'module', {courseVersionId: context.courseVersionId});
  } else {
    cannot('manage', 'all');
  }

  return build({
    detectSubjectType: (item: any) =>
      item.constructor as ExtractSubjectType<ModuleSubject>,
  });
}
