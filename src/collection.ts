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
  UpdateManyOptions,
  UpdateOneOptions,
  UpdateQuery
} from "mongodb";
import {
  Database,
  PartialRelation,
  verifyDelete,
  verifyInsert,
  verifyUpdate
} from ".";

export type CollectionOptions = PartialRelation & DbCollectionOptions;

export class Collection<TSchema extends Record<string, any>> {
  name: string;
  database: Database;
  handle: Promise<Col<TSchema>>;

  constructor(
    database: Database,
    name: string,
    { primaryKey, foreignKeys, ...mongodbOptions }: CollectionOptions = {}
  ) {
    this.name = name;
    this.database = database;
    this.handle = database.handle.then(db =>
      db.collection<TSchema>(name, mongodbOptions)
    );
    (primaryKey || foreignKeys) &&
      database.assignRelations({
        [name]: {
          primaryKey,
          foreignKeys
        }
      });
  }

  setRelation(relation: PartialRelation) {
    this.database.assignRelations({
      [this.name]: relation
    });
  }

  // Query methods :

  findOne<T = TSchema>(
    filter: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ) {
    return this.handle.then(col => col.findOne(filter, options));
  }

  find<T = TSchema>(
    query: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ) {
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

  insertOne(doc: OptionalId<TSchema>, options?: CollectionInsertOneOptions) {
    return verifyInsert(this.database, this, [doc])
      .then(() => this.handle)
      .then(col => col.insertOne(doc, options))
      .then(({ ops }) => ops[0]);
  }

  insertMany(
    docs: Array<OptionalId<TSchema>>,
    options?: CollectionInsertManyOptions
  ) {
    return verifyInsert(this.database, this, docs)
      .then(() => this.handle)
      .then(col => col.insertMany(docs, options))
      .then(({ ops }) => ops);
  }

  // Update methods :

  updateOne(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateOneOptions
  ) {
    return verifyUpdate(this.database, this, filter, update, { many: false })
      .then(() => this.handle)
      .then(col => col.updateOne(filter, update, options));
  }

  updateMany(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | Partial<TSchema>,
    options?: UpdateManyOptions
  ) {
    return verifyUpdate(this.database, this, filter, update, { many: true })
      .then(() => this.handle)
      .then(col => col.updateMany(filter, update, options));
  }

  findOneAndUpdate(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | TSchema,
    options?: FindOneAndUpdateOption<TSchema>
  ) {
    return verifyUpdate(this.database, this, filter, update, {
      many: false,
      sort: options?.sort
    })
      .then(() => this.handle)
      .then(col => col.findOneAndUpdate(filter, update, options))
      .then(({ value }) => value ?? null);
  }

  // Deletion methods :

  deleteOne(
    filter: FilterQuery<TSchema>,
    options?: CommonOptions & { bypassDocumentValidation?: boolean }
  ) {
    return verifyDelete(this.database, this, filter, { many: false })
      .then(() => this.handle)
      .then(col => col.deleteOne(filter, options));
  }

  deleteMany(filter: FilterQuery<TSchema>, options?: CommonOptions) {
    return verifyDelete(this.database, this, filter, { many: true })
      .then(() => this.handle)
      .then(col => col.deleteMany(filter, options));
  }

  findOneAndDelete(
    filter: FilterQuery<TSchema>,
    options?: FindOneAndDeleteOption<TSchema>
  ) {
    return verifyDelete(this.database, this, filter, {
      many: false,
      sort: options?.sort
    })
      .then(() => this.handle)
      .then(col => col.findOneAndDelete(filter, options))
      .then(({ value }) => value ?? null);
  }

  drop(options?: { session: ClientSession }) {
    return verifyDelete(this.database, this, {}, { many: true })
      .then(() => this.handle)
      .then(col => col.drop(options));
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
