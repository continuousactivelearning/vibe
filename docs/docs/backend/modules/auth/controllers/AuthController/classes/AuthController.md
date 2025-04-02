# Class: AuthController

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:32](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/controllers/AuthController.ts#L32)

## Constructors

### Constructor

> **new AuthController**(`authService`): `AuthController`

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:37](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/controllers/AuthController.ts#L37)

Constructs the AuthController with the required AuthService.

#### Parameters

##### authService

[`IAuthService`](../../../interfaces/IAuthService/interfaces/IAuthService.md)

Service responsible for authentication logic.

#### Returns

`AuthController`

## Methods

### changePassword()

> **changePassword**(`payload`, `request`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:65](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/controllers/AuthController.ts#L65)

Handles user password change requests.

Authorized for roles: admin, teacher, student.

#### Parameters

##### payload

[`DTOChangePassword`](../../../dtos/DTOChangePassword/classes/DTOChangePassword.md)

Details required to change user password.

##### request

[`AuthenticatedRequest`](../../../interfaces/IAuthService/interfaces/AuthenticatedRequest.md)

Authenticated request containing the user.

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Confirmation message upon successful password change.

#### Throws

`HttpError` - On business logic errors or unexpected server errors.

***

### signup()

> **signup**(`payload`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:48](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/controllers/AuthController.ts#L48)

Handles user signup requests.

#### Parameters

##### payload

[`DTOSignUp`](../../../dtos/DTOSignUp/classes/DTOSignUp.md)

User signup details validated via DTOSignUp.

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

Plain object representation of the newly created user.

***

### verifyToken()

> **verifyToken**(): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:95](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/controllers/AuthController.ts#L95)

Verifies validity of the user's token.

Authorized for admin users only.

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

Confirmation message if token is valid.
