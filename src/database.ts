import { MongoClient, Db } from "mongodb";
import { Collection, ForeignKeyDescriptor } from ".";

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

  collection<TSchema extends object>(
    name: string,
    foreignKeys?: Array<ForeignKeyDescriptor>
  ): Collection<TSchema> {
    if (!(name in this.collections))
      this.collections[name] = new Collection<TSchema>(this, name, foreignKeys);
    const collection: Collection<TSchema> = this.collections[name];
    if (foreignKeys && collection.foreignKeys !== foreignKeys)
      collection.foreignKeys = foreignKeys;
    return collection;
  }
}
