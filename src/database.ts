import { Db, MongoClient } from "mongodb";
import {
  Collection,
  CollectionOptions,
  registerRelations,
  Relation,
  RelationInput
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
    this.setRelations(relations ?? {});
  }

  collection<TSchema extends object>(name: string, config?: CollectionOptions) {
    return new Collection<TSchema>(this, name, config);
  }

  dropDatabase() {
    return this.handle.then(db => db.dropDatabase());
  }

  setRelations(relations: Record<string, RelationInput>) {
    registerRelations(this.relations, relations);
  }

  async assertIntegrity() {
    for (const name of Object.keys(this.relations))
      await this.collection(name).assertIntegrity();
  }
}
