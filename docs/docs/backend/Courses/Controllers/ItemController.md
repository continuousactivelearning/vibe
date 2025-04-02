Defined in: [controllers/ItemController.ts:31](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/ItemController.ts#L31)

## Constructors

### Constructor

> **new ItemController**(`courseRepo`): `ItemController`

Defined in: [controllers/ItemController.ts:32](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/ItemController.ts#L32)

#### Parameters

##### courseRepo

`CourseRepository`

#### Returns

`ItemController`

## Methods

### create()

> **create**(`sectionId`, `moduleId`, `versionId`, `item`): `Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [controllers/ItemController.ts:42](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/ItemController.ts#L42)

#### Parameters

##### sectionId

`string`

##### moduleId

`string`

##### versionId

`string`

##### item

[`CreateItemPayloadValidator`](../Validators/ItemValidators/CreateItemPayloadValidator.md)

#### Returns

`Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

***

### move()

> **move**(`sectionId`, `moduleId`, `versionId`, `itemId`, `body`): `Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [controllers/ItemController.ts:217](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/ItemController.ts#L217)

#### Parameters

##### sectionId

`string`

##### moduleId

`string`

##### versionId

`string`

##### itemId

`string`

##### body

[`MoveItemPayloadValidator`](../Validators/ItemValidators/MoveItemPayloadValidator.md)

#### Returns

`Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

***

### readAll()

> **readAll**(`sectionId`, `moduleId`, `versionId`): `Promise`\<\{ `itemsGroup`: [`ItemsGroup`](../Transformers/ItemsGroup.md); \}\>

Defined in: [controllers/ItemController.ts:102](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/ItemController.ts#L102)

#### Parameters

##### sectionId

`string`

##### moduleId

`string`

##### versionId

`string`

#### Returns

`Promise`\<\{ `itemsGroup`: [`ItemsGroup`](../Transformers/ItemsGroup.md); \}\>

***

### update()

> **update**(`sectionId`, `moduleId`, `versionId`, `itemId`, `payload`): `Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [controllers/ItemController.ts:136](https://github.com/continuousactivelearning/cal/blob/e8382d8ddbcc1815082ca613a620a97f6d2451f9/backend/src/modules/courses/controllers/ItemController.ts#L136)

#### Parameters

##### sectionId

`string`

##### moduleId

`string`

##### versionId

`string`

##### itemId

`string`

##### payload

[`UpdateItemPayloadValidator`](../Validators/ItemValidators/UpdateItemPayloadValidator.md)

#### Returns

`Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>
