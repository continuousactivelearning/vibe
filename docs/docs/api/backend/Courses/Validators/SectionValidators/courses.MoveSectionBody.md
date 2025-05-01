Defined in: [backend/src/modules/courses/classes/validators/SectionValidators.ts:92](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/SectionValidators.ts#L92)

Payload for reordering a section within a module.

## Constructors

### Constructor

> **new MoveSectionBody**(): `MoveSectionBody`

#### Returns

`MoveSectionBody`

## Properties

### afterSectionId?

> `optional` **afterSectionId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/SectionValidators.ts:99](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/SectionValidators.ts#L99)

Optional: move after this section ID.

***

### beforeSectionId?

> `optional` **beforeSectionId**: `string`

Defined in: [backend/src/modules/courses/classes/validators/SectionValidators.ts:107](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/SectionValidators.ts#L107)

Optional: move before this section ID.

***

### bothNotAllowed

> **bothNotAllowed**: `string`

Defined in: [backend/src/modules/courses/classes/validators/SectionValidators.ts:127](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/SectionValidators.ts#L127)

Validation helper — only one of before/after should be used.

***

### onlyOneAllowed

> **onlyOneAllowed**: `string`

Defined in: [backend/src/modules/courses/classes/validators/SectionValidators.ts:117](https://github.com/continuousactivelearning/vibe/blob/e164f8b2c6380dfb48305a4531b51d78f4a518e5/backend/src/modules/courses/classes/validators/SectionValidators.ts#L117)

Validation helper — at least one position ID must be provided.
