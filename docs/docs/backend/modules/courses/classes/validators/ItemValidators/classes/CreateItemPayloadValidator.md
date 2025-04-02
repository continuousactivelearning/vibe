# Class: CreateItemPayloadValidator

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:79](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L79)

## Implements

- [`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md)

## Constructors

### Constructor

> **new CreateItemPayloadValidator**(): `CreateItemPayloadValidator`

#### Returns

`CreateItemPayloadValidator`

## Properties

### \_id?

> `optional` **\_id**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:81](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L81)

***

### afterItemId?

> `optional` **afterItemId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:103](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L103)

***

### beforeItemId?

> `optional` **beforeItemId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:108](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L108)

***

### blogDetails?

> `optional` **blogDetails**: [`BlogDetailsPayloadValidator`](BlogDetailsPayloadValidator.md)

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:131](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L131)

***

### createdAt

> **createdAt**: `Date`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:111](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L111)

***

### description

> **description**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:89](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L89)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`description`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#description)

***

### itemDetails

> **itemDetails**: [`IVideoDetails`](../../../../../../shared/interfaces/IUser/interfaces/IVideoDetails.md) \| [`IQuizDetails`](../../../../../../shared/interfaces/IUser/interfaces/IQuizDetails.md) \| [`IBlogDetails`](../../../../../../shared/interfaces/IUser/interfaces/IBlogDetails.md)

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:98](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L98)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`itemDetails`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#itemdetails)

***

### name

> **name**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:85](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L85)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`name`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#name)

***

### order

> **order**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:95](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L95)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`order`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#order)

***

### quizDetails?

> `optional` **quizDetails**: [`QuizDetailsPayloadValidator`](QuizDetailsPayloadValidator.md)

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:137](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L137)

***

### sectionId

> **sectionId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:92](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L92)

***

### type

> **type**: [`ItemType`](../../../../../../shared/interfaces/IUser/enumerations/ItemType.md)

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:118](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L118)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`type`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#type)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:114](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L114)

***

### videoDetails?

> `optional` **videoDetails**: [`VideoDetailsPayloadValidator`](VideoDetailsPayloadValidator.md)

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:125](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/validators/ItemValidators.ts#L125)
