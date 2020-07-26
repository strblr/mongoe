import {
  ClientSession,
  Collection as Col,
  CollectionAggregationOptions,
  CollectionInsertManyOptions,
  CollectionInsertOneOptions,
  CollectionMapFunction,
  CollectionReduceFunction,
  CommonOptions,
  DbCollectionOptions,
  FilterQuery,
  FindOneAndDeleteOption,
  FindOneAndReplaceOption,
  FindOneAndUpdateOption,
  FindOneOptions,
  GeoHaystackSearchOptions,
  IndexOptions,
  IndexSpecification,
  MapReduceOptions,
  MongoCountPreferences,
  MongoDistinctPreferences,
  OptionalId,
  ReadPreferenceOrMode,
  ReplaceOneOptions,
  UpdateManyOptions,
  UpdateOneOptions,
  UpdateQuery
} from "mongodb";
import { Database, map } from ".";

export enum Policy {
  ByPass,
  Nullify,
  Unset,
  Pull,
  Delete,
  Reject
}

export type ForeignKey = {
  collection: string;
  policy: Policy | ((deletedKeys: Array<any>) => void | Promise<void>);
};

export type CollectionConfig = {
  primaryKey?: string;
  foreignKeys?: Record<string, ForeignKey>;
  mongodbOptions?: DbCollectionOptions;
};

export class Collection<TSchema extends object> {
  name: string;
  database: Database;
  handle: Promise<Col<TSchema>>;
  primaryKey: string;
  foreignKeys: Record<string, ForeignKey>;

  constructor(database: Database, name: string, config?: CollectionConfig) {
    this.name = name;
    this.database = database;
    this.handle = database.handle.then(db =>
      db.collection<TSchema>(name, config?.mongodbOptions ?? {})
    );
    this.primaryKey = config?.primaryKey ?? "_id";
    this.foreignKeys = config?.foreignKeys ?? Object.create(null);
  }

  aggregate<T = TSchema>(
    pipeline?: object[],
    options?: CollectionAggregationOptions
  ) {
    return this.handle.then(col =>
      col.aggregate<T>(pipeline, options).toArray()
    );
  }

  countDocuments(
    query?: FilterQuery<TSchema>,
    options?: MongoCountPreferences
  ) {
    return this.handle.then(col => col.countDocuments(query, options));
  }

  createIndex(fieldOrSpec: string | any, options?: IndexOptions) {
    return this.handle.then(col => col.createIndex(fieldOrSpec, options));
  }

  createIndexes(
    indexSpecs: IndexSpecification[],
    options?: { session?: ClientSession }
  ) {
    return this.handle.then(col => col.createIndexes(indexSpecs, options));
  }

  // CASCADED
  async deleteMany(filter: FilterQuery<TSchema>, options?: CommonOptions) {
    await this.database._cascade(
      this.name,
      await this._getPrimaryKeysFromFilter(filter, true)
    );
    return this.handle.then(col => col.deleteMany(filter, options));
  }

  // CASCADED
  async deleteOne(filter: FilterQuery<TSchema>, options?: CommonOptions) {
    await this.database._cascade(
      this.name,
      await this._getPrimaryKeysFromFilter(filter, false)
    );
    return this.handle.then(col => col.deleteOne(filter, options));
  }

  distinct(
    key: string,
    query?: FilterQuery<TSchema>,
    options?: MongoDistinctPreferences
  ) {
    return this.handle.then(col => col.distinct(key, query, options));
  }

  // CASCADED
  async drop(options?: { session: ClientSession }) {
    await this.database._cascade(
      this.name,
      await this._getPrimaryKeysFromFilter({}, true)
    );
    return this.handle.then(col => col.drop(options));
  }

  dropIndex(
    indexName: string,
    options?: CommonOptions & { maxTimeMS?: number }
  ) {
    return this.handle.then(col => col.dropIndex(indexName, options));
  }

  dropIndexes(options?: { session?: ClientSession; maxTimeMS?: number }) {
    return this.handle.then(col => col.dropIndexes(options));
  }

  estimatedDocumentCount(
    query?: FilterQuery<TSchema>,
    options?: MongoCountPreferences
  ) {
    return this.handle.then(col => col.estimatedDocumentCount(query, options));
  }

  find(query: FilterQuery<TSchema>, options?: FindOneOptions) {
    return this.handle.then(col => col.find(query, options).toArray());
  }

  findOne(filter: FilterQuery<TSchema>, options?: FindOneOptions) {
    return this.handle.then(col => col.findOne(filter, options));
  }

  // CASCADED
  async findOneAndDelete(
    filter: FilterQuery<TSchema>,
    options?: FindOneAndDeleteOption
  ) {
    await this.database._cascade(
      this.name,
      await this._getPrimaryKeysFromFilter(filter, false)
    );
    return this.handle
      .then(col => col.findOneAndDelete(filter, options))
      .then(({ value }) => value || null);
  }

  findOneAndReplace(
    filter: FilterQuery<TSchema>,
    replacement: OptionalId<TSchema>,
    options?: FindOneAndReplaceOption
  ) {
    return this.handle
      .then(col => col.findOneAndReplace(filter, replacement, options))
      .then(({ value }) => value || null);
  }

  findOneAndUpdate(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | TSchema,
    options?: FindOneAndUpdateOption
  ) {
    return this.handle
      .then(col => col.findOneAndUpdate(filter, update, options))
      .then(({ value }) => value || null);
  }

  geoHaystackSearch(x: number, y: number, options?: GeoHaystackSearchOptions) {
    return this.handle.then(col => col.geoHaystackSearch(x, y, options));
  }

  indexes(options?: { session: ClientSession }) {
    return this.handle.then(col => col.indexes(options));
  }

  indexExists(
    indexes: string | string[],
    options?: { session: ClientSession }
  ) {
    return this.handle.then(col => col.indexExists(indexes, options));
  }

  indexInformation(options?: { full: boolean; session: ClientSession }) {
    return this.handle.then(col => col.indexInformation(options));
  }

  insertMany(
    docs: Array<OptionalId<TSchema>>,
    options?: CollectionInsertManyOptions
  ) {
    return this.handle
      .then(col => col.insertMany(docs, options))
      .then(({ ops }) => ops);
  }

  insertOne(docs: OptionalId<TSchema>, options?: CollectionInsertOneOptions) {
    return this.handle
      .then(col => col.insertOne(docs, options))
      .then(({ ops }) => ops[0]);
  }

  isCapped(options?: { session: ClientSession }) {
    return this.handle.then(col => col.isCapped(options));
  }

  listIndexes(options?: {
    batchSize?: number;
    readPreference?: ReadPreferenceOrMode;
    session?: ClientSession;
  }) {
    return this.handle.then(col => col.listIndexes(options).toArray());
  }

  mapReduce<TKey, TValue>(
    map: CollectionMapFunction<TSchema> | string,
    reduce: CollectionReduceFunction<TKey, TValue> | string,
    options?: MapReduceOptions
  ) {
    return this.handle.then(col =>
      col.mapReduce<TKey, TValue>(map, reduce, options)
    );
  }

  mongodbOptions(options?: { session: ClientSession }) {
    return this.handle.then(col => col.options(options));
  }

  reIndex(options?: { session: ClientSession }) {
    return this.handle.then(col => col.reIndex(options));
  }

  rename(
    newName: string,
    options?: { dropTarget?: boolean; session?: ClientSession }
  ) {
    return this.handle
      .then(col => col.rename(newName, options))
      .then(() => {
        delete this.database.collections[this.name];
        this.name = newName;
        this.database.collections[this.name] = this;
      });
  }

  replaceOne(
    filter: FilterQuery<TSchema>,
    doc: TSchema,
    options?: ReplaceOneOptions
  ) {
    return this.handle
      .then(col => col.replaceOne(filter, doc, options))
      .then(({ ops }): TSchema => ops[0]);
  }

  stats(options?: { scale: number; session?: ClientSession }) {
    return this.handle.then(col => col.stats(options));
  }

  updateMany(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateManyOptions
  ) {
    return this.handle.then(col => col.updateMany(filter, update, options));
  }

  updateOne(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateOneOptions
  ) {
    return this.handle.then(col => col.updateOne(filter, update, options));
  }

  async _cascade(name: string, deletedKeys: Array<any>) {
    const actions: Array<() => Promise<void>> = [];
    const foreignKeys = Object.entries(this.foreignKeys).filter(
      ([, { collection }]) => collection === name
    );

    for (const [key, { policy }] of foreignKeys) {
      switch (policy) {
        case Policy.ByPass:
          break;
        case Policy.Nullify:
          break;
        case Policy.Unset:
          break;
        case Policy.Pull:
          break;
        case Policy.Delete:
          break;
        case Policy.Reject:
          break;
        default:
          if (typeof policy !== "function")
            throw new Error(
              `Invalid foreign key policy in Collection ${this.name}`
            );
          actions.push(async () => policy.bind(this)(deletedKeys));
      }
    }

    return actions;
  }

  // Helpers

  _getPrimaryKeysFromFilter(filter: FilterQuery<TSchema>, multiple: boolean) {
    const options = { fields: { [this.primaryKey]: 1 } };
    return multiple
      ? this.find(filter, options).then(docs => map(docs, this.primaryKey))
      : this.findOne(filter, options).then(doc =>
          doc ? map([doc], this.primaryKey) : []
        );
  }
}
