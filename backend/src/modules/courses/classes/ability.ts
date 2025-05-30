import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import {Course, CourseVersion, Item, Module, Section} from './transformers'; // Adjust the import path as necessary

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Modules =
  | InferSubjects<
      | typeof Course
      | typeof CourseVersion
      | typeof Item
      | typeof Module
      | typeof Section
    >
  | 'all';

export type AppAbility = MongoAbility<[Actions, Modules]>;

interface User {
  id: string;
  role: string;
}

export function defineAbilitiesFor(user: User): AppAbility {
  const {can, cannot, build} = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  if (user.role === 'admin') {
    can('manage', 'all');
  } else if (user.role === 'instructor') {
    can(['read', 'update'], Course /*{ instructorId: user.id }*/);
    can(['create', 'read', 'update'], Item /*{ creatorId: user.id }*/);
  } else if (user.role === 'student') {
    can('read', Course);
    can('read', Item);
  } else {
    cannot('manage', 'all');
  }
  return build({
    detectSubjectType: item => item.constructor as ExtractSubjectType<Modules>,
  });
}
