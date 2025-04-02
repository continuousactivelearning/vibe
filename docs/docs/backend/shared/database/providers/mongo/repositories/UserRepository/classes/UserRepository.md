# Class: UserRepository

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:9](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L9)

Interface representing a repository for user-related operations.

## Implements

- [`IUserRepository`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md)

## Constructors

### Constructor

> **new UserRepository**(`db`): `UserRepository`

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:12](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L12)

#### Parameters

##### db

[`MongoDatabase`](../../../MongoDatabase/classes/MongoDatabase.md)

#### Returns

`UserRepository`

## Methods

### addRole()

> **addRole**(`firebaseUID`, `role`): `Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:74](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L74)

Adds a role to a user.

#### Parameters

##### firebaseUID

`string`

##### role

`string`

#### Returns

`Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

#### Implementation of

[`IUserRepository`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md).[`addRole`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md#addrole)

***

### create()

> **create**(`user`): `Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:47](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L47)

Creates a new user in the database.
- Generates a MongoDB `_id` internally but uses `firebaseUID` as the external identifier.

#### Parameters

##### user

[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)

#### Returns

`Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

#### Implementation of

[`IUserRepository`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md).[`create`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md#create)

***

### findByEmail()

> **findByEmail**(`email`): `Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:56](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L56)

Finds a user by email.

#### Parameters

##### email

`string`

#### Returns

`Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

#### Implementation of

[`IUserRepository`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md).[`findByEmail`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md#findbyemail)

***

### findByFirebaseUID()

> **findByFirebaseUID**(`firebaseUID`): `Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:65](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L65)

Finds a user by Firebase UID.

#### Parameters

##### firebaseUID

`string`

#### Returns

`Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

***

### removeRole()

> **removeRole**(`firebaseUID`, `role`): `Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:87](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L87)

Removes a role from a user.

#### Parameters

##### firebaseUID

`string`

##### role

`string`

#### Returns

`Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

#### Implementation of

[`IUserRepository`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md).[`removeRole`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md#removerole)

***

### updatePassword()

> **updatePassword**(`firebaseUID`, `password`): `Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/providers/mongo/repositories/UserRepository.ts:100](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/repositories/UserRepository.ts#L100)

Updates a user's password.

#### Parameters

##### firebaseUID

`string`

##### password

`string`

#### Returns

`Promise`\<[`IUser`](../../../../../../interfaces/IUser/interfaces/IUser.md)\>

#### Implementation of

[`IUserRepository`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md).[`updatePassword`](../../../../../interfaces/IUserRepository/interfaces/IUserRepository.md#updatepassword)
