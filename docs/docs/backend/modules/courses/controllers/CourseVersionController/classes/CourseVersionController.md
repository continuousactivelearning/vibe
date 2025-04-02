# Class: CourseVersionController

Defined in: [backend/src/modules/courses/controllers/CourseVersionController.ts:21](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseVersionController.ts#L21)

## Constructors

### Constructor

> **new CourseVersionController**(`courseRepo`): `CourseVersionController`

Defined in: [backend/src/modules/courses/controllers/CourseVersionController.ts:22](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseVersionController.ts#L22)

#### Parameters

##### courseRepo

[`CourseRepository`](../../../../../shared/database/providers/mongo/repositories/CourseRepository/classes/CourseRepository.md)

#### Returns

`CourseVersionController`

## Methods

### create()

> **create**(`id`, `payload`): `Promise`\<\{ `course`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/CourseVersionController.ts:27](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseVersionController.ts#L27)

#### Parameters

##### id

`string`

##### payload

[`CreateCourseVersionPayloadValidator`](../../../classes/validators/CourseVersionValidators/classes/CreateCourseVersionPayloadValidator.md)

#### Returns

`Promise`\<\{ `course`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

***

### read()

> **read**(`id`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [backend/src/modules/courses/controllers/CourseVersionController.ts:69](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/CourseVersionController.ts#L69)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>
