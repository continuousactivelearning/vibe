# Class: Item

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:9](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L9)

## Implements

- [`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md)

## Constructors

### Constructor

> **new Item**(`itemPayload`, `existingItems`): `Item`

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:30](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L30)

#### Parameters

##### itemPayload

[`CreateItemPayloadValidator`](../../../validators/ItemValidators/classes/CreateItemPayloadValidator.md)

##### existingItems

`Item`[]

#### Returns

`Item`

## Properties

### description

> **description**: `string`

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:19](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L19)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`description`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#description)

***

### itemDetails

> **itemDetails**: [`IVideoDetails`](../../../../../../shared/interfaces/IUser/interfaces/IVideoDetails.md) \| [`IQuizDetails`](../../../../../../shared/interfaces/IUser/interfaces/IQuizDetails.md) \| [`IBlogDetails`](../../../../../../shared/interfaces/IUser/interfaces/IBlogDetails.md)

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:28](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L28)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`itemDetails`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#itemdetails)

***

### itemId?

> `optional` **itemId**: [`ID`](../../../../../../shared/types/type-aliases/ID.md)

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:13](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L13)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`itemId`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#itemid)

***

### name

> **name**: `string`

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:16](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L16)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`name`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#name)

***

### order

> **order**: `string`

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:25](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L25)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`order`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#order)

***

### type

> **type**: [`ItemType`](../../../../../../shared/interfaces/IUser/enumerations/ItemType.md)

Defined in: [backend/src/modules/courses/classes/transformers/Item.ts:22](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Item.ts#L22)

#### Implementation of

[`IBaseItem`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md).[`type`](../../../../../../shared/interfaces/IUser/interfaces/IBaseItem.md#type)
