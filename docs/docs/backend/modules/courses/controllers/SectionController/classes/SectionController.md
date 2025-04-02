# Class: SectionController

Defined in: [backend/src/modules/courses/controllers/SectionController.ts:22](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/SectionController.ts#L22)

## Constructors

### Constructor

> **new SectionController**(`courseRepo`): `SectionController`

Defined in: [backend/src/modules/courses/controllers/SectionController.ts:23](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/SectionController.ts#L23)

#### Parameters

##### courseRepo

[`CourseRepository`](../../../../../shared/database/providers/mongo/repositories/CourseRepository/classes/CourseRepository.md)

#### Returns

`SectionController`

## Methods

### create()

> **create**(`versionId`, `moduleId`, `payload`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/SectionController.ts:33](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/SectionController.ts#L33)

#### Parameters

##### versionId

`string`

##### moduleId

`string`

##### payload

[`CreateSectionPayloadValidator`](../../../classes/validators/SectionValidators/classes/CreateSectionPayloadValidator.md)

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

***

### move()

> **move**(`versionId`, `moduleId`, `sectionId`, `body`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/SectionController.ts:132](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/SectionController.ts#L132)

#### Parameters

##### versionId

`string`

##### moduleId

`string`

##### sectionId

`string`

##### body

###### afterSectionId?

`string`

###### beforeSectionId?

`string`

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

***

### update()

> **update**(`versionId`, `moduleId`, `sectionId`, `payload`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/SectionController.ts:82](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/SectionController.ts#L82)

#### Parameters

##### versionId

`string`

##### moduleId

`string`

##### sectionId

`string`

##### payload

`Partial`\<[`CreateSectionPayloadValidator`](../../../classes/validators/SectionValidators/classes/CreateSectionPayloadValidator.md)\>

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>
