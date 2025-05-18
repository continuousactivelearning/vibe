Defined in: [backend/src/modules/auth/controllers/AuthController.ts:37](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/controllers/AuthController.ts#L37)

Controller that handles all authentication-related HTTP endpoints.
Exposes routes for user registration, password management, and token verification.

## Constructors

### Constructor

> **new AuthController**(`authService`): `AuthController`

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:44](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/controllers/AuthController.ts#L44)

Creates a new instance of the AuthController.
Uses dependency injection to receive an implementation of IAuthService.

#### Parameters

##### authService

[`IAuthService`](../Interfaces/auth.IAuthService.md)

The authentication service implementation to use

#### Returns

`AuthController`

## Methods

### changePassword()

> **changePassword**(`body`, `request`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:75](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/controllers/AuthController.ts#L75)

Handles requests to change a user's password.
Only accessible to authenticated users with admin, teacher, or student roles.

#### Parameters

##### body

[`ChangePasswordBody`](../Validators/auth.ChangePasswordBody.md)

Contains the new password and confirmation password

##### request

`AuthenticatedRequest`

The authenticated HTTP request containing the current user

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

A success object with confirmation message upon successful password change

#### Throws

HttpError(400) - If password validation fails

#### Throws

HttpError(500) - If an unexpected server error occurs

***

### signup()

> **signup**(`body`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:58](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/controllers/AuthController.ts#L58)

Handles user signup/registration requests.
Creates new user accounts using the provided credentials.

#### Parameters

##### body

[`SignUpBody`](../Validators/auth.SignUpBody.md)

Validated signup data containing email, password, and name information

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

A plain JavaScript object representation of the newly created user

#### Throws

HttpError - If user creation fails for any reason

***

### verifyToken()

> **verifyToken**(): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [backend/src/modules/auth/controllers/AuthController.ts:104](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/controllers/AuthController.ts#L104)

Verifies if the user's authentication token is valid.
This endpoint is restricted to admin users only.
Simply returning a success message confirms the token is valid,
as the

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

A confirmation object with message indicating the token is valid

#### Authorized

decorator would have rejected the request otherwise.

#### Throws

Automatically rejects unauthorized requests via the

#### Authorized

decorator
