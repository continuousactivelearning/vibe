# Function: calculateNewOrder()

> **calculateNewOrder**\<`T`\>(`sortedEntities`, `idField`, `afterId`?, `beforeId`?): `string`

Defined in: [backend/src/modules/courses/utils/calculateNewOrder.ts:7](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/courses/utils/calculateNewOrder.ts#L7)

Calculates the order for a new entity (Module, Section, or Item)

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\>

## Parameters

### sortedEntities

`T`[]

### idField

keyof `T`

### afterId?

`string`

### beforeId?

`string`

## Returns

`string`
