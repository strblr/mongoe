import { Db, MongoClient } from "mongodb";
import {
  Collection,
  CollectionOptions,
  registerRelations,
  Relation,
  RelationInput,
  verifyIntegrity
} from ".";

export class Database {
  name: string;
  handle: Promise<Db>;
  relations: Record<string, Relation> = {};

  constructor(
    url: string,
    name: string,
    relations?: Record<string, RelationInput>
  ) {
    this.name = name;
    this.handle = MongoClient.connect(url, {
      useUnifiedTopology: true
    }).then(client => client.db(name));
    this.registerRelations(relations ?? {});
  }

  collection<TSchema extends object>(name: string, config?: CollectionOptions) {
    return new Collection<TSchema>(this, name, config);
  }

  dropDatabase() {
    return this.handle.then(db => db.dropDatabase());
  }

  registerRelations(relations: Record<string, RelationInput>) {
    registerRelations(this.relations, relations);
  }

  assertIntegrity() {
    return verifyIntegrity(this);
  }
}
