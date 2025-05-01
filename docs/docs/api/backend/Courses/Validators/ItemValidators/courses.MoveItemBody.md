Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:353](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/ItemValidators.ts#L353)

Body to move an item within its section.

## Constructors

### Constructor

> **new MoveItemBody**(): `MoveItemBody`

#### Returns

`MoveItemBody`

## Properties

### afterItemId?

> `optional` **afterItemId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:360](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/ItemValidators.ts#L360)

Move after this item (optional).

***

### beforeItemId?

> `optional` **beforeItemId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:368](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/ItemValidators.ts#L368)

Move before this item (optional).

***

### bothNotAllowed

> **bothNotAllowed**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:386](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/ItemValidators.ts#L386)

Validation helper – both afterItemId and beforeItemId cannot be present at the same time.

***

### onlyOneAllowed

> **onlyOneAllowed**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:377](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/ItemValidators.ts#L377)

Validation helper – at least one of afterItemId or beforeItemId must be present.
