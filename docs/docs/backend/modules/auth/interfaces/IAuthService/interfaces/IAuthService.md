# Interface: IAuthService

Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:59](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/interfaces/IAuthService.ts#L59)

Interface representing the authentication service.

## Methods

### changePassword()

> **changePassword**(`payload`, `requestUser`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:83](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/interfaces/IAuthService.ts#L83)

Changes the password of a user.

#### Parameters

##### payload

[`ChangePasswordPayload`](ChangePasswordPayload.md)

The payload containing the new password information.

##### requestUser

[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)

The user requesting the password change.

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

A promise that resolves to a confirmation string.

***

### signup()

> **signup**(`payload`): `Promise`\<[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:66](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/interfaces/IAuthService.ts#L66)

Signs up a new user.

#### Parameters

##### payload

[`SignUpPayload`](SignUpPayload.md)

The payload containing the sign-up information.

#### Returns

`Promise`\<[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the created user.

***

### verifyToken()

> **verifyToken**(`token`): `Promise`\<[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:74](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/interfaces/IAuthService.ts#L74)

Verifies a given token.

#### Parameters

##### token

`string`

The token to verify.

#### Returns

`Promise`\<[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the user associated with the token.
