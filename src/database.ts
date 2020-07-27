import { MongoClient, Db } from "mongodb";
import { Collection, CollectionConfig, flatten } from ".";

export class Database {
  name: string;
  handle: Promise<Db>;
  collections: Record<string, Collection<any>>;

  constructor(url: string, name: string) {
    this.name = name;
    this.handle = MongoClient.connect(url, {
      useUnifiedTopology: true
    }).then(client => client.db(name));
    this.collections = Object.create(null);
  }

  collection<TSchema extends object>(
    name: string,
    config?: CollectionConfig
  ): Collection<TSchema> {
    if (!(name in this.collections))
      this.collections[name] = new Collection<TSchema>(this, name, config);
    return this.collections[name];
  }

  dropDatabase() {
    return this.handle.then(db => db.dropDatabase());
  }

  _cascade(name: string, deletedKeys: Array<any>) {
    return Promise.all(
      Object.values(this.collections).map(collection =>
        collection._cascade(name, deletedKeys)
      )
    )
      .then(actions => flatten(actions))
      .then(actions => Promise.all(actions.map(action => action())));
  }
}
