# Class: CourseRepository

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:14](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L14)

## Implements

- [`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md)

## Constructors

### Constructor

> **new CourseRepository**(`db`): `CourseRepository`

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:19](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L19)

#### Parameters

##### db

[`MongoDatabase`](../../../MongoDatabase/classes/MongoDatabase.md)

#### Returns

`CourseRepository`

## Methods

### create()

> **create**(`course`): `Promise`\<[`Course`](../../../../../../../modules/courses/classes/transformers/Course/classes/Course.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:30](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L30)

#### Parameters

##### course

[`Course`](../../../../../../../modules/courses/classes/transformers/Course/classes/Course.md)

#### Returns

`Promise`\<[`Course`](../../../../../../../modules/courses/classes/transformers/Course/classes/Course.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`create`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#create)

***

### createItemsGroup()

> **createItemsGroup**(`itemsGroup`): `Promise`\<[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:177](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L177)

#### Parameters

##### itemsGroup

[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)

#### Returns

`Promise`\<[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`createItemsGroup`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#createitemsgroup)

***

### createVersion()

> **createVersion**(`courseVersion`): `Promise`\<[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:100](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L100)

#### Parameters

##### courseVersion

[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)

#### Returns

`Promise`\<[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`createVersion`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#createversion)

***

### delete()

> **delete**(`id`): `Promise`\<`boolean`\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:97](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L97)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`delete`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#delete)

***

### read()

> **read**(`id`): `Promise`\<[`ICourse`](../../../../../../interfaces/IUser/interfaces/ICourse.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:50](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L50)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`ICourse`](../../../../../../interfaces/IUser/interfaces/ICourse.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`read`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#read)

***

### readItemsGroup()

> **readItemsGroup**(`itemsGroupId`): `Promise`\<[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:198](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L198)

#### Parameters

##### itemsGroupId

`string`

#### Returns

`Promise`\<[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`readItemsGroup`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#readitemsgroup)

***

### readVersion()

> **readVersion**(`versionId`): `Promise`\<[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:125](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L125)

#### Parameters

##### versionId

`string`

#### Returns

`Promise`\<[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`readVersion`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#readversion)

***

### update()

> **update**(`id`, `course`): `Promise`\<[`ICourse`](../../../../../../interfaces/IUser/interfaces/ICourse.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:67](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L67)

#### Parameters

##### id

`string`

##### course

`Partial`\<[`ICourse`](../../../../../../interfaces/IUser/interfaces/ICourse.md)\>

#### Returns

`Promise`\<[`ICourse`](../../../../../../interfaces/IUser/interfaces/ICourse.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`update`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#update)

***

### updateItemsGroup()

> **updateItemsGroup**(`itemsGroupId`, `itemsGroup`): `Promise`\<[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:213](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L213)

#### Parameters

##### itemsGroupId

`string`

##### itemsGroup

[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)

#### Returns

`Promise`\<[`ItemsGroup`](../../../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`updateItemsGroup`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#updateitemsgroup)

***

### updateVersion()

> **updateVersion**(`versionId`, `courseVersion`): `Promise`\<[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts:148](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/CourseRepository.ts#L148)

#### Parameters

##### versionId

`string`

##### courseVersion

[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)

#### Returns

`Promise`\<[`CourseVersion`](../../../../../../../modules/courses/classes/transformers/CourseVersion/classes/CourseVersion.md)\>

#### Implementation of

[`ICourseRepository`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md).[`updateVersion`](../../../../../interfaces/ICourseRepository/interfaces/ICourseRepository.md#updateversion)
