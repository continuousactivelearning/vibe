Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:104](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/courses/classes/validators/ItemValidators.ts#L104)

Blog item details for content-based reading or writing activities.

## Implements

- `IBlogDetails`

## Constructors

### Constructor

> **new BlogDetailsPayloadValidator**(): `BlogDetailsPayloadValidator`

#### Returns

`BlogDetailsPayloadValidator`

## Properties

### content

> **content**: `string`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:116](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/courses/classes/validators/ItemValidators.ts#L116)

Full blog content in markdown or plain text.

#### Implementation of

`IBlogDetails.content`

***

### estimatedReadTimeInMinutes

> **estimatedReadTimeInMinutes**: `number`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:130](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/courses/classes/validators/ItemValidators.ts#L130)

Estimated time to complete the blog in minutes.

#### Implementation of

`IBlogDetails.estimatedReadTimeInMinutes`

***

### points

> **points**: `number`

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:123](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/courses/classes/validators/ItemValidators.ts#L123)

Points assigned to the blog submission.

#### Implementation of

`IBlogDetails.points`

***

### tags

> **tags**: `string`[]

Defined in: [backend/src/modules/courses/classes/validators/ItemValidators.ts:109](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/courses/classes/validators/ItemValidators.ts#L109)

Tags for categorizing the blog (auto-managed).

#### Implementation of

`IBlogDetails.tags`
