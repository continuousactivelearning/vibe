Defined in: [backend/src/modules/courses/classes/validators/CourseValidators.ts:45](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseValidators.ts#L45)

DTO for updating a course.
Allows partial updates.

## Implements

- `Partial`\<`ICourse`\>

## Constructors

### Constructor

> **new UpdateCourseBody**(): `UpdateCourseBody`

#### Returns

`UpdateCourseBody`

## Properties

### description

> **description**: `string`

Defined in: [backend/src/modules/courses/classes/validators/CourseValidators.ts:64](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseValidators.ts#L64)

New course description (optional).
Must be between 3 and 1000 characters.

#### Implementation of

`Partial.description`

***

### name

> **name**: `string`

Defined in: [backend/src/modules/courses/classes/validators/CourseValidators.ts:54](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseValidators.ts#L54)

New name for the course (optional).
Must be between 3 and 255 characters.

#### Implementation of

`Partial.name`

***

### nameOrDescription

> **nameOrDescription**: `string`

Defined in: [backend/src/modules/courses/classes/validators/CourseValidators.ts:74](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseValidators.ts#L74)

At least one of `name` or `description` must be present.
This virtual field is used for validation purposes only.
