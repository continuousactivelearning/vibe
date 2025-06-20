import { AuthenticatedUser, AuthenticatedUserEnrollements } from "#root/shared/interfaces/models.js";
import { AbilityBuilder, CreateAbility, createMongoAbility, MongoAbility } from "@casl/ability";




// Scopes
class EnrollmentScope {
    courseId: string;
    versionId: string;
}

class ProgressScope {
    courseId: string;
    versionId: string;
    userId: string;
}

// Actions
export enum EnrollmentActions {
    Create = "create",
    Modify = "modify",
    Delete = "delete",
    View = "view"
}

export enum ProgressActions {
    Modify = "modify",
    View = "view"
}

//Subjects
export type EnrollmentSubjectType = EnrollmentScope | 'Enrollment';
export type ProgressSubjectType = ProgressScope | 'Progress';

//Actions
export type EnrollmentActionsType = `${EnrollmentActions}` | 'manage';
export type ProgressActionsType = `${ProgressActions}` | 'manage';

//Abilities
export type EnrollmentAbility = [EnrollmentActionsType, EnrollmentSubjectType]
export type ProgressAbility = [ProgressActionsType, ProgressSubjectType]

//Module Ability
export type UsersModuleAbility = MongoAbility<EnrollmentAbility | ProgressAbility>;


export function getUserAbility(user: AuthenticatedUser){
    const {can, cannot, build} = new AbilityBuilder(createMongoAbility as CreateAbility<UsersModuleAbility>);
    if(user.globalRole === 'admin'){
        can('manage', 'Enrollment');
        can('manage', 'Progress');
    }

    user.enrollments.forEach((enrollment: AuthenticatedUserEnrollements) => {
        const courseBounded = { courseId: enrollment.courseId };
        const versionBounded = { courseId: enrollment.courseId, versionId: enrollment.versionId };
        const userBounded = { userId: user.userId, courseId: enrollment.courseId, versionId: enrollment.versionId };

        switch (enrollment.role) {
            case 'student':
                can('view', 'Enrollment', userBounded);
                can('view', 'Progress', versionBounded);
                break;
            case 'instructor':
                can('view', 'Enrollment', courseBounded);
                can('view', 'Progress', courseBounded);
                can('modify', 'Progress', courseBounded);
                cannot('delete', 'Enrollment', courseBounded);
                cannot('modify', 'Enrollment', userBounded);
                break;
            case 'manager':
                can('manage', 'Enrollment', courseBounded);
                can('manage', 'Progress', courseBounded);
                cannot('modify', 'Progress', courseBounded);
                cannot('delete', 'Enrollment', userBounded);
                break;
            case 'ta':
                can('view', 'Enrollment', versionBounded);
                can('view', 'Progress', versionBounded);
                break;
        }
    });
    return build();
}