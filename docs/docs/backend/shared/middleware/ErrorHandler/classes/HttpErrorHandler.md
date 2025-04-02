# Class: HttpErrorHandler

Defined in: [backend/src/shared/middleware/ErrorHandler.ts:18](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/middleware/ErrorHandler.ts#L18)

## Implements

- `ExpressErrorMiddlewareInterface`

## Constructors

### Constructor

> **new HttpErrorHandler**(): `HttpErrorHandler`

#### Returns

`HttpErrorHandler`

## Methods

### error()

> **error**(`error`, `request`, `response`, `next`): `void`

Defined in: [backend/src/shared/middleware/ErrorHandler.ts:19](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/middleware/ErrorHandler.ts#L19)

Called before response.send is being called. The data passed to method is the data passed to .send method.
Note that you must return same (or changed) data and it will be passed to .send method.

#### Parameters

##### error

`any`

##### request

`any`

##### response

`any`

##### next

(`err`) => `any`

#### Returns

`void`

#### Implementation of

`ExpressErrorMiddlewareInterface.error`
