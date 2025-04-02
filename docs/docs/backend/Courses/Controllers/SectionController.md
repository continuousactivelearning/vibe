Defined in: [controllers/SectionController.ts:26](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/SectionController.ts#L26)

## Constructors

### Constructor

> **new SectionController**(`courseRepo`): `SectionController`

Defined in: [controllers/SectionController.ts:27](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/SectionController.ts#L27)

#### Parameters

##### courseRepo

`CourseRepository`

#### Returns

`SectionController`

## Methods

### create()

> **create**(`versionId`, `moduleId`, `payload`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [controllers/SectionController.ts:37](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/SectionController.ts#L37)

#### Parameters

##### versionId

`string`

##### moduleId

`string`

##### payload

[`CreateSectionPayloadValidator`](../Validators/ModuleValidators/CreateSectionPayloadValidator.md)

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

***

### move()

> **move**(`versionId`, `moduleId`, `sectionId`, `body`): `Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [controllers/SectionController.ts:136](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/SectionController.ts#L136)

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

Defined in: [controllers/SectionController.ts:86](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/SectionController.ts#L86)

#### Parameters

##### versionId

`string`

##### moduleId

`string`

##### sectionId

`string`

##### payload

`Partial`\<[`CreateSectionPayloadValidator`](../Validators/ModuleValidators/CreateSectionPayloadValidator.md)\>

#### Returns

`Promise`\<\{ `version`: `Record`\<`string`, `any`\>; \}\>
