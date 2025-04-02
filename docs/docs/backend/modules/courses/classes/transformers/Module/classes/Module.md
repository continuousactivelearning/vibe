# Class: Module

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:11](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L11)

## Implements

- [`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md)

## Constructors

### Constructor

> **new Module**(`modulePayload`, `existingModules`): `Module`

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:38](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L38)

#### Parameters

##### modulePayload

[`CreateModulePayloadValidator`](../../../validators/ModuleValidators/classes/CreateModulePayloadValidator.md)

##### existingModules

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md)[]

#### Returns

`Module`

## Properties

### createdAt

> **createdAt**: `Date`

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:32](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L32)

#### Implementation of

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md).[`createdAt`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md#createdat)

***

### description

> **description**: `string`

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:21](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L21)

#### Implementation of

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md).[`description`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md#description)

***

### moduleId?

> `optional` **moduleId**: [`ID`](../../../../../../shared/types/type-aliases/ID.md)

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:15](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L15)

#### Implementation of

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md).[`moduleId`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md#moduleid)

***

### name

> **name**: `string`

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:18](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L18)

#### Implementation of

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md).[`name`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md#name)

***

### order

> **order**: `string`

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:24](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L24)

#### Implementation of

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md).[`order`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md#order)

***

### sections

> **sections**: [`Section`](../../Section/classes/Section.md)[]

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:28](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L28)

#### Implementation of

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md).[`sections`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md#sections)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [backend/src/modules/courses/classes/transformers/Module.ts:36](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/classes/transformers/Module.ts#L36)

#### Implementation of

[`IModule`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md).[`updatedAt`](../../../../../../shared/interfaces/IUser/interfaces/IModule.md#updatedat)
