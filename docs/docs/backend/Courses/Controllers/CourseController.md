Defined in: [controllers/CourseController.ts:29](https://github.com/continuousactivelearning/cal/blob/e06c4332ead0ef718e54921eb9e9d365189f3ab9/backend/src/modules/courses/controllers/CourseController.ts#L29)

Course data transformation.

## Constructors

### Constructor

> **new CourseController**(`courseRepo`): `CourseController`

Defined in: [controllers/CourseController.ts:30](https://github.com/continuousactivelearning/cal/blob/e06c4332ead0ef718e54921eb9e9d365189f3ab9/backend/src/modules/courses/controllers/CourseController.ts#L30)

#### Parameters

##### courseRepo

`CourseRepository`

#### Returns

`CourseController`

## Methods

### create()

> **create**(`payload`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [controllers/CourseController.ts:36](https://github.com/continuousactivelearning/cal/blob/e06c4332ead0ef718e54921eb9e9d365189f3ab9/backend/src/modules/courses/controllers/CourseController.ts#L36)

#### Parameters

##### payload

`CreateCoursePayloadValidator`

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

***

### read()

> **read**(`id`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [controllers/CourseController.ts:48](https://github.com/continuousactivelearning/cal/blob/e06c4332ead0ef718e54921eb9e9d365189f3ab9/backend/src/modules/courses/controllers/CourseController.ts#L48)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

***

### update()

> **update**(`id`, `payload`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [controllers/CourseController.ts:62](https://github.com/continuousactivelearning/cal/blob/e06c4332ead0ef718e54921eb9e9d365189f3ab9/backend/src/modules/courses/controllers/CourseController.ts#L62)

#### Parameters

##### id

`string`

##### payload

`UpdateCoursePayloadValidator`

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>
