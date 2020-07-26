import { MongoClient, Db } from "mongodb";
import { Collection, CollectionConfig, flatten } from ".";

export class Database {
  name: string;
  handle: Promise<Db>;
  collections: Record<string, Collection<any>>;

  constructor(url: string, databaseName: string) {
    this.name = databaseName;
    this.handle = MongoClient.connect(url, {
      useUnifiedTopology: true
    }).then(client => client.db(databaseName));
    this.collections = Object.create(null);
  }

  collection<TSchema extends object>(name: string, config?: CollectionConfig) {
    if (!(name in this.collections))
      this.collections[name] = new Collection<TSchema>(this, name, config);
    const collection: Collection<TSchema> = this.collections[name];
    return collection;
  }

  dropDatabase() {
    return this.handle.then(db => db.dropDatabase());
  }

  _cascade(name: string, deletedKeys: Array<any>) {
    const cascades = Object.values(this.collections).map(collection =>
      collection._cascade(name, deletedKeys)
    );
    return Promise.all(cascades)
      .then(actions => flatten(actions))
      .then(actions => Promise.all(actions.map(action => action())));
  }
}
