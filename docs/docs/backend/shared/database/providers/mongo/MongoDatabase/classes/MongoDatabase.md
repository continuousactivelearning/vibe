# Class: MongoDatabase

Defined in: [backend/src/shared/database/providers/mongo/MongoDatabase.ts:16](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/MongoDatabase.ts#L16)

MongoDatabase

## Implements

## Description

A service class for managing MongoDB connections and operations.

## Example

```ts
const mongoDatabase = new MongoDatabase('mongodb://localhost:27017', 'myDatabase');
```

## Template

## Implements

- [`IDatabase`](../../../../interfaces/IDatabase/interfaces/IDatabase.md)\<`Db`\>

## Constructors

### Constructor

> **new MongoDatabase**(`uri`, `dbName`): `MongoDatabase`

Defined in: [backend/src/shared/database/providers/mongo/MongoDatabase.ts:25](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/MongoDatabase.ts#L25)

Creates an instance of MongoDatabase.

#### Parameters

##### uri

`string`

The MongoDB connection URI.

##### dbName

`string`

The name of the database to connect to.

#### Returns

`MongoDatabase`

## Properties

### database

> **database**: `Db`

Defined in: [backend/src/shared/database/providers/mongo/MongoDatabase.ts:18](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/MongoDatabase.ts#L18)

#### Implementation of

[`IDatabase`](../../../../interfaces/IDatabase/interfaces/IDatabase.md).[`database`](../../../../interfaces/IDatabase/interfaces/IDatabase.md#database)

## Methods

### disconnect()

> **disconnect**(): `Promise`\<`Db`\>

Defined in: [backend/src/shared/database/providers/mongo/MongoDatabase.ts:48](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/MongoDatabase.ts#L48)

Disconnects from the MongoDB database.

#### Returns

`Promise`\<`Db`\>

The disconnected database instance, or null if already disconnected.

#### Implementation of

[`IDatabase`](../../../../interfaces/IDatabase/interfaces/IDatabase.md).[`disconnect`](../../../../interfaces/IDatabase/interfaces/IDatabase.md#disconnect)

***

### getCollection()

> **getCollection**\<`T`\>(`name`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [backend/src/shared/database/providers/mongo/MongoDatabase.ts:79](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/MongoDatabase.ts#L79)

Retrieves a collection from the connected database.

#### Type Parameters

##### T

`T` *extends* `Document`

#### Parameters

##### name

`string`

The name of the collection to retrieve.

#### Returns

`Promise`\<`Collection`\<`T`\>\>

The MongoDB collection.

#### Throws

Will throw an error if the database is not connected.

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [backend/src/shared/database/providers/mongo/MongoDatabase.ts:61](https://github.com/continuousactivelearning/cal/blob/5ae0447098795fdcf3a415f0360ebe51565b6949/backend/src/shared/database/providers/mongo/MongoDatabase.ts#L61)

Checks if the database is connected.

#### Returns

`boolean`

True if the database is connected, false otherwise.

#### Implementation of

[`IDatabase`](../../../../interfaces/IDatabase/interfaces/IDatabase.md).[`isConnected`](../../../../interfaces/IDatabase/interfaces/IDatabase.md#isconnected)
