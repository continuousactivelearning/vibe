Defined in: [controllers/CourseController.ts:28](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/CourseController.ts#L28)

## Constructors

### Constructor

> **new CourseController**(`courseRepo`): `CourseController`

Defined in: [controllers/CourseController.ts:29](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/CourseController.ts#L29)

#### Parameters

##### courseRepo

`CourseRepository`

#### Returns

`CourseController`

## Methods

### create()

> **create**(`payload`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [controllers/CourseController.ts:35](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/CourseController.ts#L35)

#### Parameters

##### payload

[`CreateCoursePayloadValidator`](../Validators/CourseValidators/CreateCoursePayloadValidator.md)

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

***

### read()

> **read**(`id`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [controllers/CourseController.ts:47](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/CourseController.ts#L47)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

***

### update()

> **update**(`id`, `payload`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [controllers/CourseController.ts:61](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/CourseController.ts#L61)

#### Parameters

##### id

`string`

##### payload

[`UpdateCoursePayloadValidator`](../Validators/CourseValidators/UpdateCoursePayloadValidator.md)

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>
