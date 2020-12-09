import { Db, MongoClient } from "mongodb";
import {
  Collection,
  CollectionOptions,
  normalizeRelations,
  PartialRelations,
  Relations,
  verifyIntegrity
} from ".";

export class Database {
  name: string;
  handle: Promise<Db>;
  relations: Relations;

  constructor(url: string, name: string, relations?: PartialRelations) {
    this.name = name;
    this.handle = MongoClient.connect(url, {
      useUnifiedTopology: true
    }).then(client => client.db(name));
    this.relations = normalizeRelations(relations);
  }

  collection<TSchema extends Record<string, any>>(
    name: string,
    config?: CollectionOptions
  ) {
    return new Collection<TSchema>(this, name, config);
  }

  dropDatabase() {
    return this.handle.then(db => db.dropDatabase());
  }

  setRelations(relations: PartialRelations) {
    this.relations = normalizeRelations(relations);
  }

  assignRelations(relations: PartialRelations) {
    Object.assign(this.relations, normalizeRelations(relations));
  }

  assertIntegrity() {
    return verifyIntegrity(this);
  }
}
