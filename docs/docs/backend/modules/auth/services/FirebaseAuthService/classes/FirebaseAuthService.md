# Class: FirebaseAuthService

Defined in: [backend/src/modules/auth/services/FirebaseAuthService.ts:36](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/services/FirebaseAuthService.ts#L36)

Interface representing the authentication service.

## Implements

- [`IAuthService`](../../../interfaces/IAuthService/interfaces/IAuthService.md)

## Constructors

### Constructor

> **new FirebaseAuthService**(`userRepository`): `FirebaseAuthService`

Defined in: [backend/src/modules/auth/services/FirebaseAuthService.ts:38](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/services/FirebaseAuthService.ts#L38)

#### Parameters

##### userRepository

[`IUserRepository`](../../../../../shared/database/interfaces/IUserRepository/interfaces/IUserRepository.md)

#### Returns

`FirebaseAuthService`

## Methods

### changePassword()

> **changePassword**(`payload`, `requestUser`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [backend/src/modules/auth/services/FirebaseAuthService.ts:96](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/services/FirebaseAuthService.ts#L96)

Changes the password of a user.

#### Parameters

##### payload

[`ChangePasswordPayload`](../../../interfaces/IAuthService/interfaces/ChangePasswordPayload.md)

The payload containing the new password information.

##### requestUser

[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)

The user requesting the password change.

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

A promise that resolves to a confirmation string.

#### Implementation of

[`IAuthService`](../../../interfaces/IAuthService/interfaces/IAuthService.md).[`changePassword`](../../../interfaces/IAuthService/interfaces/IAuthService.md#changepassword)

***

### signup()

> **signup**(`payload`): `Promise`\<`any`\>

Defined in: [backend/src/modules/auth/services/FirebaseAuthService.ts:63](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/services/FirebaseAuthService.ts#L63)

Signs up a new user.

#### Parameters

##### payload

[`SignUpPayload`](../../../interfaces/IAuthService/interfaces/SignUpPayload.md)

The payload containing the sign-up information.

#### Returns

`Promise`\<`any`\>

A promise that resolves to the created user.

#### Implementation of

[`IAuthService`](../../../interfaces/IAuthService/interfaces/IAuthService.md).[`signup`](../../../interfaces/IAuthService/interfaces/IAuthService.md#signup)

***

### verifyToken()

> **verifyToken**(`token`): `Promise`\<[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)\>

Defined in: [backend/src/modules/auth/services/FirebaseAuthService.ts:44](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/services/FirebaseAuthService.ts#L44)

Verifies a given token.

#### Parameters

##### token

`string`

The token to verify.

#### Returns

`Promise`\<[`IUser`](../../../../../shared/interfaces/IUser/interfaces/IUser.md)\>

A promise that resolves to the user associated with the token.

#### Implementation of

[`IAuthService`](../../../interfaces/IAuthService/interfaces/IAuthService.md).[`verifyToken`](../../../interfaces/IAuthService/interfaces/IAuthService.md#verifytoken)
