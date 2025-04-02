# Interface: IItemRepository

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:3](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L3)

## Methods

### createBlogDetails()

> **createBlogDetails**(`details`): `Promise`\<`string`\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:11](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L11)

#### Parameters

##### details

[`IBlogDetails`](../../../../interfaces/IUser/interfaces/IBlogDetails.md)

#### Returns

`Promise`\<`string`\>

***

### createItem()

> **createItem**(`item`): `Promise`\<[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:4](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L4)

#### Parameters

##### item

[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)

#### Returns

`Promise`\<[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)\>

***

### createQuizDetails()

> **createQuizDetails**(`details`): `Promise`\<`string`\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:10](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L10)

#### Parameters

##### details

[`IQuizDetails`](../../../../interfaces/IUser/interfaces/IQuizDetails.md)

#### Returns

`Promise`\<`string`\>

***

### createVideoDetails()

> **createVideoDetails**(`details`): `Promise`\<`string`\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:9](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L9)

#### Parameters

##### details

[`IVideoDetails`](../../../../interfaces/IUser/interfaces/IVideoDetails.md)

#### Returns

`Promise`\<`string`\>

***

### deleteItem()

> **deleteItem**(`itemId`): `Promise`\<`boolean`\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:7](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L7)

#### Parameters

##### itemId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### readBlogDetails()

> **readBlogDetails**(`detailsId`): `Promise`\<[`IBlogDetails`](../../../../interfaces/IUser/interfaces/IBlogDetails.md)\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:15](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L15)

#### Parameters

##### detailsId

`string`

#### Returns

`Promise`\<[`IBlogDetails`](../../../../interfaces/IUser/interfaces/IBlogDetails.md)\>

***

### readItem()

> **readItem**(`itemId`): `Promise`\<[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:5](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L5)

#### Parameters

##### itemId

`string`

#### Returns

`Promise`\<[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)\>

***

### readQuizDetails()

> **readQuizDetails**(`detailsId`): `Promise`\<[`IQuizDetails`](../../../../interfaces/IUser/interfaces/IQuizDetails.md)\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:14](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L14)

#### Parameters

##### detailsId

`string`

#### Returns

`Promise`\<[`IQuizDetails`](../../../../interfaces/IUser/interfaces/IQuizDetails.md)\>

***

### readVideoDetails()

> **readVideoDetails**(`detailsId`): `Promise`\<[`IVideoDetails`](../../../../interfaces/IUser/interfaces/IVideoDetails.md)\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:13](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L13)

#### Parameters

##### detailsId

`string`

#### Returns

`Promise`\<[`IVideoDetails`](../../../../interfaces/IUser/interfaces/IVideoDetails.md)\>

***

### updateItem()

> **updateItem**(`itemId`, `item`): `Promise`\<[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)\>

Defined in: [backend/src/shared/database/interfaces/IItemRepository.ts:6](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IItemRepository.ts#L6)

#### Parameters

##### itemId

`string`

##### item

`Partial`\<[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)\>

#### Returns

`Promise`\<[`IBaseItem`](../../../../interfaces/IUser/interfaces/IBaseItem.md)\>
