import { MongoClient, Db, OptionalId, FilterQuery, UpdateQuery } from "mongodb";
import { Collection, CollectionConfig } from ".";

export type Relation = {
  primaryKey?: string;
  foreignKeys?: Record<string, ForeignKey>;
};

export type ForeignKey = {
  collection: string;
  policy: Policy;
};

export enum Policy {
  ByPass,
  Nullify,
  Unset,
  Pull,
  Delete,
  Reject
}

export class Database {
  name: string;
  handle: Promise<Db>;
  relations: Record<string, Relation>;

  constructor(url: string, name: string, relations?: Record<string, Relation>) {
    this.name = name;
    this.handle = MongoClient.connect(url, {
      useUnifiedTopology: true
    }).then(client => client.db(name));
    this.relations = relations ?? Object.create(null);
  }

  collection<TSchema extends object>(name: string, config?: CollectionConfig) {
    return new Collection<TSchema>(this, name, config);
  }

  dropDatabase() {
    return this.handle.then(db => db.dropDatabase());
  }

  assertIntegrity() {
    console.log("Asserting integrity");
  }

  _checkInsert<TSchema>(collection: string, docs: Array<OptionalId<TSchema>>) {
    console.log("Checking insert");
  }

  _checkUpdate<TSchema>(
    collection: string,
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | TSchema,
    many = false
  ) {
    console.log("Checking update");
  }

  _checkDelete<TSchema>(
    collection: string,
    filter: FilterQuery<TSchema>,
    many = false
  ) {
    console.log("Checking delete");
  }
}

/*
  REMOVE Filter F in Collection C {
    Filters <= [(F, C)]
    AllKeys <= []
    AllActions <= [DELETE(F, C)]

    WHILE((F, C) in Filters) {
      NewKeys <= C.keysOfFilter(F) MINUS AllKeys
      if(NewKeys IS EMPTY)
        continue

      NewActions <= Db.propagate(NewKeys)
      if(NewActions CONTAINS REJECT)
        REJECT REMOVE

      Filters.push(filtersIn(NewActions))
      AllKeys.push(NewKeys)
      AllActions.push(NewActions)
    }

    EXECUTE AllActions.reverse()
  }
 */

/*

 */
