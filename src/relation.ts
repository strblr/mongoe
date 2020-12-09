import {
  FilterQuery,
  OptionalId,
  SortOptionObject,
  UpdateQuery
} from "mongodb";
import { Collection, Database } from ".";

export enum Policy {
  ByPass,
  Delete,
  Reject
  /*  Nullify,
  Unset,
  Pull*/
}

export type Relations = Record<string, Relation>;

export type PartialRelations = Record<string, PartialRelation>;

export type Relation = {
  primaryKey: string;
  foreignKeys: Record<string, [string, Policy]>;
};

export type PartialRelation = Partial<Relation>;

export function normalizeRelation(relation?: PartialRelation): Relation {
  return {
    primaryKey: relation?.primaryKey ?? "_id",
    foreignKeys: relation?.foreignKeys ?? {}
  };
}

export function normalizeRelations(relations?: PartialRelations) {
  return Object.entries(relations ?? {}).reduce<Relations>(
    (acc, [name, relation]) => ({
      ...acc,
      [name]: normalizeRelation(relation)
    }),
    {}
  );
}

export async function verifyIntegrity(database: Database) {
  // ...
}

export async function verifyInsert<TSchema extends Record<string, any>>(
  database: Database,
  collection: Collection<TSchema>,
  docs: Array<OptionalId<TSchema>>
) {
  // ...
}

export async function verifyUpdate<TSchema extends Record<string, any>>(
  database: Database,
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
  database: Database,
  collection: Collection<any>,
  filter: FilterQuery<any>,
  options: {
    many: boolean;
    sort?: SortOptionObject<any>;
  }
) {
  return;
  const relation = database.relations[collection.name] ?? normalizeRelation({});

  const keys = await collection
    .find(filter, {
      projection: { [relation.primaryKey]: 1 },
      sort: options.sort as any,
      limit: options.many ? undefined : 1
    })
    .then(docs => docs.map(doc => doc[relation.primaryKey]));

  console.log("Want to remove", keys, "in", collection.name);

  for (const [siblingCollectionName, relation] of Object.entries(
    database.relations
  ))
    for (const [foreignKey, [foreignCollectionName, policy]] of Object.entries(
      relation.foreignKeys
    )) {
      if (collection.name === foreignCollectionName)
        switch (policy) {
          case Policy.ByPass:
            break;
          case Policy.Reject:
            throw new Error(
              `Mongoe: Deletion rejected by foreign key <${foreignKey}> on collection <${siblingCollectionName}>`
            );
          case Policy.Delete:
            const sibling = database.collection(siblingCollectionName);
            /*const docs = await sibling.find({ [foreignKey]: { $in: keys } });
            console.log("Must also remove from", sibling.name, ":", docs);*/
            await sibling.deleteMany({ [foreignKey]: { $in: keys } });
        }
    }
}
