<<<<<<< HEAD
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:26](https://github.com/saaranshgarg1/vibe/blob/92f3eed6f8b269ad4e4d39a2fa93008a887aa76f/backend/src/modules/auth/interfaces/IAuthService.ts#L26)
=======
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:26](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/interfaces/IAuthService.ts#L26)
>>>>>>> 8b14a9cc35ef20bd7bf087ce1213759164e46ae9

Interface representing the authentication service.
Defines the contract that any authentication service implementation
must fulfill, regardless of the underlying authentication provider.

## Methods

### changePassword()

> **changePassword**(`body`, `requestUser`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

<<<<<<< HEAD
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:59](https://github.com/saaranshgarg1/vibe/blob/92f3eed6f8b269ad4e4d39a2fa93008a887aa76f/backend/src/modules/auth/interfaces/IAuthService.ts#L59)
=======
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:59](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/interfaces/IAuthService.ts#L59)
>>>>>>> 8b14a9cc35ef20bd7bf087ce1213759164e46ae9

Changes the password for an authenticated user.
Validates that the new password meets requirements and updates
the user's credentials in the authentication system.

#### Parameters

##### body

[`ChangePasswordBody`](../../Other/auth.ChangePasswordBody.md)

The payload containing the new password and confirmation

##### requestUser

`IUser`

The authenticated user requesting the password change

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

A promise that resolves to a confirmation object with success status and message

#### Throws

Error - If password change fails or validation errors occur

***

### signup()

> **signup**(`body`): `Promise`\<`IUser`\>

<<<<<<< HEAD
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:37](https://github.com/saaranshgarg1/vibe/blob/92f3eed6f8b269ad4e4d39a2fa93008a887aa76f/backend/src/modules/auth/interfaces/IAuthService.ts#L37)
=======
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:37](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/interfaces/IAuthService.ts#L37)
>>>>>>> 8b14a9cc35ef20bd7bf087ce1213759164e46ae9

Signs up a new user in the system.
Creates a new user account with the provided credentials and
stores the user information in the database.

#### Parameters

##### body

[`SignUpBody`](../../Other/auth.SignUpBody.md)

The validated payload containing user registration information
              including email, password, first name, and last name

#### Returns

`Promise`\<`IUser`\>

A promise that resolves to the newly created user object

#### Throws

Error - If user creation fails for any reason

***

### verifyToken()

> **verifyToken**(`token`): `Promise`\<`IUser`\>

<<<<<<< HEAD
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:47](https://github.com/saaranshgarg1/vibe/blob/92f3eed6f8b269ad4e4d39a2fa93008a887aa76f/backend/src/modules/auth/interfaces/IAuthService.ts#L47)
=======
Defined in: [backend/src/modules/auth/interfaces/IAuthService.ts:47](https://github.com/continuousactivelearning/vibe/blob/2acbe3b478970855555eb5e714d2dc1713e5937b/backend/src/modules/auth/interfaces/IAuthService.ts#L47)
>>>>>>> 8b14a9cc35ef20bd7bf087ce1213759164e46ae9

Verifies the validity of an authentication token.
Decodes the token and retrieves the associated user information.

#### Parameters

##### token

`string`

The authentication token to verify (typically a JWT)

#### Returns

`Promise`\<`IUser`\>

A promise that resolves to the user associated with the token

#### Throws

Error - If the token is invalid, expired, or cannot be verified
