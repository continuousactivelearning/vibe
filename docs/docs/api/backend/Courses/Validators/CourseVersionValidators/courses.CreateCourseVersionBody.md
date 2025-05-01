Defined in: [backend/src/modules/courses/classes/validators/CourseVersionValidators.ts:10](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L10)

DTO for creating a new course version.

## Implements

- `Partial`\<`ICourseVersion`\>

## Constructors

### Constructor

> **new CreateCourseVersionBody**(): `CreateCourseVersionBody`

#### Returns

`CreateCourseVersionBody`

## Properties

### courseId?

> `optional` **courseId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/CourseVersionValidators.ts:16](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L16)

ID of the course this version belongs to.
This is auto-populated and should remain empty in the request body.

#### Implementation of

`Partial.courseId`

***

### description

> **description**: `string`

Defined in: [backend/src/modules/courses/classes/validators/CourseVersionValidators.ts:30](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L30)

A brief description of the course version.

#### Implementation of

`Partial.description`

***

### version

> **version**: `string`

Defined in: [backend/src/modules/courses/classes/validators/CourseVersionValidators.ts:23](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L23)

The version label or identifier (e.g., "v1.0", "Fall 2025").

#### Implementation of

`Partial.version`
