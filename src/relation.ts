import {
  FilterQuery,
  ObjectId,
  OptionalId,
  SortOptionObject,
  UpdateQuery
} from "mongodb";
import { Collection, Database, substractKeys } from ".";

export type Relation = {
  primaryKey: string;
  foreignRefs: Array<readonly [string, string, Policy]>;
};

export type RelationInput = {
  primaryKey?: string;
  foreignKeys?: Record<string, readonly [string, Policy]>;
};

export enum Policy {
  ByPass,
  Delete,
  Reject,
  Nullify
  /*Unset,
  Pull*/
}

export function registerRelations(
  relations: Record<string, Relation>,
  inputs: Record<string, RelationInput>
) {
  for (const [collection, relation] of Object.entries(inputs)) {
    if (!relations[collection])
      relations[collection] = {
        primaryKey: relation.primaryKey ?? "_id",
        foreignRefs: []
      };
    else if (relation.primaryKey)
      relations[collection].primaryKey = relation.primaryKey;
    for (const [foreignKey, [foreignCollection, policy]] of Object.entries(
      relation.foreignKeys ?? {}
    )) {
      const foreignRef = [collection, foreignKey, policy] as const;
      if (!relations[foreignCollection])
        relations[foreignCollection] = {
          primaryKey: "_id",
          foreignRefs: [foreignRef]
        };
      else relations[foreignCollection].foreignRefs.push(foreignRef);
    }
  }
}

export async function verifyIntegrity(database: Database) {
  // ...
}

export async function verifyInsert<TSchema extends Record<string, any>>(
  collection: Collection<TSchema>,
  docs: Array<OptionalId<TSchema>>
) {
  // ...
}

export async function verifyUpdate<TSchema extends Record<string, any>>(
  collection: Collection<TSchema>,
  filter: FilterQuery<TSchema>,
  update: UpdateQuery<TSchema> | Partial<TSchema>,
  options: {
    many: boolean;
    sort?: SortOptionObject<any>;
  }
) {
  // ...
}

export async function verifyDelete(
  collection: Collection<any>,
  filter: FilterQuery<any>,
  deletedKeys: Record<string, Array<any>>,
  options: {
    many: boolean;
    sort?: SortOptionObject<any>;
  }
) {
  if (!deletedKeys[collection.name]) deletedKeys[collection.name] = [];

  const alreadyDeleted = deletedKeys[collection.name];
  const { primaryKey, foreignRefs } = collection.database.relations[
    collection.name
  ];

  const keys = await collection
    .find(filter, {
      projection: { [primaryKey]: 1 },
      sort: options.sort,
      limit: options.many ? undefined : 1
    })
    .then(docs => docs.map(doc => doc[primaryKey]))
    .then(keys => substractKeys(keys, alreadyDeleted));

  alreadyDeleted.push(...keys);

  console.log("Want to remove", keys, "in", collection.name);
  console.log("State of deletedKeys:", deletedKeys, "\n");

  for (const [foreignCollectionName, foreignKey, policy] of foreignRefs) {
    const foreignCollection = collection.database.collection(
      foreignCollectionName
    );
    if (await foreignCollection.countDocuments({ [foreignKey]: { $in: keys } }))
      switch (policy) {
        case Policy.ByPass:
          break;
        case Policy.Reject:
          throw new Error(
            `Mongoe: Deletion rejected by foreign key <${foreignKey}> on collection <${foreignCollectionName}>`
          );
        case Policy.Delete:
          await foreignCollection.deleteMany(
            { [foreignKey]: { $in: keys } },
            undefined,
            deletedKeys
          );
          break;
        case Policy.Nullify:
          await foreignCollection.updateMany(
            { [foreignKey]: { $in: keys } },
            { $set: { [foreignKey]: null } }
          );
      }
  }
}
