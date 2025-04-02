# Interface: ICourseRepository

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:4](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L4)

## Methods

### create()

> **create**(`course`): `Promise`\<[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:5](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L5)

#### Parameters

##### course

[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)

#### Returns

`Promise`\<[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)\>

***

### createItemsGroup()

> **createItemsGroup**(`itemsGroup`): `Promise`\<[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:17](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L17)

#### Parameters

##### itemsGroup

[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)

#### Returns

`Promise`\<[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

***

### createVersion()

> **createVersion**(`courseVersion`): `Promise`\<[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:10](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L10)

#### Parameters

##### courseVersion

[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)

#### Returns

`Promise`\<[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)\>

***

### delete()

> **delete**(`id`): `Promise`\<`boolean`\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:8](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L8)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`boolean`\>

***

### read()

> **read**(`id`): `Promise`\<[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:6](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L6)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)\>

***

### readItemsGroup()

> **readItemsGroup**(`itemsGroupId`): `Promise`\<[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:18](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L18)

#### Parameters

##### itemsGroupId

`string`

#### Returns

`Promise`\<[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

***

### readVersion()

> **readVersion**(`versionId`): `Promise`\<[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:11](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L11)

#### Parameters

##### versionId

`string`

#### Returns

`Promise`\<[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)\>

***

### update()

> **update**(`id`, `course`): `Promise`\<[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:7](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L7)

#### Parameters

##### id

`string`

##### course

`Partial`\<[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)\>

#### Returns

`Promise`\<[`ICourse`](../../../../interfaces/IUser/interfaces/ICourse.md)\>

***

### updateItemsGroup()

> **updateItemsGroup**(`itemsGroupId`, `itemsGroup`): `Promise`\<[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:19](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L19)

#### Parameters

##### itemsGroupId

`string`

##### itemsGroup

[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)

#### Returns

`Promise`\<[`ItemsGroup`](../../../../../modules/courses/classes/transformers/Item/classes/ItemsGroup.md)\>

***

### updateVersion()

> **updateVersion**(`versionId`, `courseVersion`): `Promise`\<[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)\>

Defined in: [backend/src/shared/database/interfaces/ICourseRepository.ts:12](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/ICourseRepository.ts#L12)

#### Parameters

##### versionId

`string`

##### courseVersion

[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)

#### Returns

`Promise`\<[`ICourseVersion`](../../../../interfaces/IUser/interfaces/ICourseVersion.md)\>
