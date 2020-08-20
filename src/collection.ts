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
import { Database } from ".";

export type CollectionConfig = {
  mongodbOptions?: DbCollectionOptions;
};

export class Collection<TSchema extends object> {
  name: string;
  database: Database;
  handle: Promise<Col<TSchema>>;

  constructor(database: Database, name: string, config?: CollectionConfig) {
    this.name = name;
    this.database = database;
    this.handle = database.handle.then(db =>
      db.collection<TSchema>(name, config?.mongodbOptions ?? {})
    );
  }

  // Query methods :

  findOne(filter: FilterQuery<TSchema>, options?: FindOneOptions) {
    return this.handle.then(col => col.findOne(filter, options));
  }

  find(query: FilterQuery<TSchema>, options?: FindOneOptions) {
    return this.handle.then(col => col.find(query, options).toArray());
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

  distinct(
    key: string,
    query?: FilterQuery<TSchema>,
    options?: MongoDistinctPreferences
  ) {
    return this.handle.then(col => col.distinct(key, query, options));
  }

  estimatedDocumentCount(
    query?: FilterQuery<TSchema>,
    options?: MongoCountPreferences
  ) {
    return this.handle.then(col => col.estimatedDocumentCount(query, options));
  }

  geoHaystackSearch(x: number, y: number, options?: GeoHaystackSearchOptions) {
    return this.handle.then(col => col.geoHaystackSearch(x, y, options));
  }

  isCapped(options?: { session: ClientSession }) {
    return this.handle.then(col => col.isCapped(options));
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

  stats(options?: { scale: number; session?: ClientSession }) {
    return this.handle.then(col => col.stats(options));
  }

  mongodbOptions(options?: { session: ClientSession }) {
    return this.handle.then(col => col.options(options));
  }

  // Insert methods :

  insertOne(docs: OptionalId<TSchema>, options?: CollectionInsertOneOptions) {
    return this.handle
      .then(col => col.insertOne(docs, options))
      .then(({ ops }) => ops[0]);
  }

  insertMany(
    docs: Array<OptionalId<TSchema>>,
    options?: CollectionInsertManyOptions
  ) {
    return this.handle
      .then(col => col.insertMany(docs, options))
      .then(({ ops }) => ops);
  }

  // Update methods :

  updateOne(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateOneOptions
  ) {
    return this.handle.then(col => col.updateOne(filter, update, options));
  }

  updateMany(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateManyOptions
  ) {
    return this.handle.then(col => col.updateMany(filter, update, options));
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

  findOneAndUpdate(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | TSchema,
    options?: FindOneAndUpdateOption
  ) {
    return this.handle
      .then(col => col.findOneAndUpdate(filter, update, options))
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

  // Deletion methods :

  deleteOne(filter: FilterQuery<TSchema>, options?: CommonOptions) {
    return this.handle.then(col => col.deleteOne(filter, options));
  }

  deleteMany(filter: FilterQuery<TSchema>, options?: CommonOptions) {
    return this.handle.then(col => col.deleteMany(filter, options));
  }

  findOneAndDelete(
    filter: FilterQuery<TSchema>,
    options?: FindOneAndDeleteOption
  ) {
    return this.handle
      .then(col => col.findOneAndDelete(filter, options))
      .then(({ value }) => value || null);
  }

  drop(options?: { session: ClientSession }) {
    return this.handle.then(col => col.drop(options));
  }

  // Indexation methods :

  createIndex(fieldOrSpec: string | any, options?: IndexOptions) {
    return this.handle.then(col => col.createIndex(fieldOrSpec, options));
  }

  createIndexes(
    indexSpecs: IndexSpecification[],
    options?: { session?: ClientSession }
  ) {
    return this.handle.then(col => col.createIndexes(indexSpecs, options));
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

  listIndexes(options?: {
    batchSize?: number;
    readPreference?: ReadPreferenceOrMode;
    session?: ClientSession;
  }) {
    return this.handle.then(col => col.listIndexes(options).toArray());
  }

  reIndex(options?: { session: ClientSession }) {
    return this.handle.then(col => col.reIndex(options));
  }
}
