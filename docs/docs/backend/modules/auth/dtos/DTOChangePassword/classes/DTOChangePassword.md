# Class: DTOChangePassword

Defined in: [backend/src/modules/auth/dtos/DTOChangePassword.ts:15](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/dtos/DTOChangePassword.ts#L15)

Payload for changing the user's password.

## Implements

- [`ChangePasswordPayload`](../../../interfaces/IAuthService/interfaces/ChangePasswordPayload.md)

## Constructors

### Constructor

> **new DTOChangePassword**(): `DTOChangePassword`

#### Returns

`DTOChangePassword`

## Properties

### newPassword

> **newPassword**: `string`

Defined in: [backend/src/modules/auth/dtos/DTOChangePassword.ts:24](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/dtos/DTOChangePassword.ts#L24)

The new password to be set.

#### Implementation of

[`ChangePasswordPayload`](../../../interfaces/IAuthService/interfaces/ChangePasswordPayload.md).[`newPassword`](../../../interfaces/IAuthService/interfaces/ChangePasswordPayload.md#newpassword)

***

### newPasswordConfirm

> **newPasswordConfirm**: `string`

Defined in: [backend/src/modules/auth/dtos/DTOChangePassword.ts:34](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/modules/auth/dtos/DTOChangePassword.ts#L34)

Confirmation of the new password.

#### Implementation of

[`ChangePasswordPayload`](../../../interfaces/IAuthService/interfaces/ChangePasswordPayload.md).[`newPasswordConfirm`](../../../interfaces/IAuthService/interfaces/ChangePasswordPayload.md#newpasswordconfirm)
