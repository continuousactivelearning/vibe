# Class: ModuleController

Defined in: [backend/src/modules/courses/controllers/ModuleController.ts:31](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ModuleController.ts#L31)

## Constructors

### Constructor

> **new ModuleController**(`courseRepo`): `ModuleController`

Defined in: [backend/src/modules/courses/controllers/ModuleController.ts:32](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ModuleController.ts#L32)

#### Parameters

##### courseRepo

[`CourseRepository`](../../../../../shared/database/providers/mongo/repositories/CourseRepository/classes/CourseRepository.md)

#### Returns

`ModuleController`

## Methods

### create()

> **create**(`params`, `payload`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/ModuleController.ts:41](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ModuleController.ts#L41)

#### Parameters

##### params

`CreateParams`

##### payload

[`CreateModulePayloadValidator`](../../../classes/validators/ModuleValidators/classes/CreateModulePayloadValidator.md)

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

***

### move()

> **move**(`versionId`, `moduleId`, `body`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/ModuleController.ts:116](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ModuleController.ts#L116)

#### Parameters

##### versionId

`string`

##### moduleId

`string`

##### body

###### afterModuleId?

`string`

###### beforeModuleId?

`string`

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

***

### update()

> **update**(`versionId`, `moduleId`, `payload`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/ModuleController.ts:74](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ModuleController.ts#L74)

#### Parameters

##### versionId

`string`

##### moduleId

`string`

##### payload

`Partial`\<[`CreateModulePayloadValidator`](../../../classes/validators/ModuleValidators/classes/CreateModulePayloadValidator.md)\>

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>
