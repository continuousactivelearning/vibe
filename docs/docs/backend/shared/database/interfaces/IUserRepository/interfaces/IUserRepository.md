# Interface: IUserRepository

Defined in: [backend/src/shared/database/interfaces/IUserRepository.ts:6](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IUserRepository.ts#L6)

Interface representing a repository for user-related operations.

## Methods

### addRole()

> **addRole**(`userId`, `role`): `Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/interfaces/IUserRepository.ts:27](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IUserRepository.ts#L27)

Adds a role to a user.

#### Parameters

##### userId

`string`

The ID of the user to add the role to.

##### role

`string`

The role to add.

#### Returns

`Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the updated user if successful, or null if not.

***

### create()

> **create**(`user`): `Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/interfaces/IUserRepository.ts:12](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IUserRepository.ts#L12)

Creates a new user.

#### Parameters

##### user

[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)

The user to create.

#### Returns

`Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the created user.

***

### findByEmail()

> **findByEmail**(`email`): `Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/interfaces/IUserRepository.ts:19](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IUserRepository.ts#L19)

Finds a user by their email.

#### Parameters

##### email

`string`

The email of the user to find.

#### Returns

`Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the user if found, or null if not found.

***

### removeRole()

> **removeRole**(`userId`, `role`): `Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/interfaces/IUserRepository.ts:35](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IUserRepository.ts#L35)

Removes a role from a user.

#### Parameters

##### userId

`string`

The ID of the user to remove the role from.

##### role

`string`

The role to remove.

#### Returns

`Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the updated user if successful, or null if not.

***

### updatePassword()

> **updatePassword**(`userId`, `password`): `Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/shared/database/interfaces/IUserRepository.ts:43](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/interfaces/IUserRepository.ts#L43)

Updates the password of a user.

#### Parameters

##### userId

`string`

The ID of the user to update the password for.

##### password

`string`

The new password.

#### Returns

`Promise`\<[`IUser`](../../../../interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the updated user if successful, or null if not.
