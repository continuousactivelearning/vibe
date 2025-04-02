# Class: ItemController

Defined in: [backend/src/modules/courses/controllers/ItemController.ts:27](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ItemController.ts#L27)

## Constructors

### Constructor

> **new ItemController**(`courseRepo`): `ItemController`

Defined in: [backend/src/modules/courses/controllers/ItemController.ts:28](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ItemController.ts#L28)

#### Parameters

##### courseRepo

[`CourseRepository`](../../../../../shared/database/providers/mongo/repositories/CourseRepository/classes/CourseRepository.md)

#### Returns

`ItemController`

## Methods

### create()

> **create**(`sectionId`, `moduleId`, `versionId`, `item`): `Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/ItemController.ts:38](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ItemController.ts#L38)

#### Parameters

##### sectionId

`string`

##### moduleId

`string`

##### versionId

`string`

##### item

[`CreateItemPayloadValidator`](../../../classes/validators/ItemValidators/classes/CreateItemPayloadValidator.md)

#### Returns

`Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

***

### move()

> **move**(`sectionId`, `moduleId`, `versionId`, `itemId`, `body`): `Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/ItemController.ts:213](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ItemController.ts#L213)

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

[`MoveItemPayloadValidator`](../../../classes/validators/ItemValidators/classes/MoveItemPayloadValidator.md)

#### Returns

`Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

***

### readAll()

> **readAll**(`sectionId`, `moduleId`, `versionId`): `Promise`\<\{ `itemsGroup`: [`ItemsGroup`](../../../classes/transformers/Item/classes/ItemsGroup.md); \}\>

Defined in: [backend/src/modules/courses/controllers/ItemController.ts:98](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ItemController.ts#L98)

#### Parameters

##### sectionId

`string`

##### moduleId

`string`

##### versionId

`string`

#### Returns

`Promise`\<\{ `itemsGroup`: [`ItemsGroup`](../../../classes/transformers/Item/classes/ItemsGroup.md); \}\>

***

### update()

> **update**(`sectionId`, `moduleId`, `versionId`, `itemId`, `payload`): `Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>

Defined in: [backend/src/modules/courses/controllers/ItemController.ts:132](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/controllers/ItemController.ts#L132)

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

[`UpdateItemPayloadValidator`](../../../classes/validators/ItemValidators/classes/UpdateItemPayloadValidator.md)

#### Returns

`Promise`\<\{ `itemsGroup`: `Record`\<`string`, `any`\>; `version`: `Record`\<`string`, `any`\>; \}\>
