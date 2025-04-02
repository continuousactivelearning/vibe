# Class: CourseController

Defined in: [backend/src/modules/courses/controllers/CourseController.ts:35](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseController.ts#L35)

## Constructors

### Constructor

> **new CourseController**(`courseRepo`): `CourseController`

Defined in: [backend/src/modules/courses/controllers/CourseController.ts:36](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseController.ts#L36)

#### Parameters

##### courseRepo

[`CourseRepository`](../../../../../shared/database/providers/mongo/repositories/CourseRepository/classes/CourseRepository.md)

#### Returns

`CourseController`

## Methods

### create()

> **create**(`payload`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [backend/src/modules/courses/controllers/CourseController.ts:43](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseController.ts#L43)

#### Parameters

##### payload

[`CreateCoursePayloadValidator`](../../../classes/validators/CourseValidators/classes/CreateCoursePayloadValidator.md)

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

***

### read()

> **read**(`id`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [backend/src/modules/courses/controllers/CourseController.ts:57](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseController.ts#L57)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

***

### update()

> **update**(`id`, `payload`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [backend/src/modules/courses/controllers/CourseController.ts:71](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseController.ts#L71)

#### Parameters

##### id

`string`

##### payload

[`UpdateCoursePayloadValidator`](../../../classes/validators/CourseValidators/classes/UpdateCoursePayloadValidator.md)

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>
