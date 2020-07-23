import {
  BulkWriteOperation,
  ClientSession,
  Collection as Col,
  CollectionAggregationOptions,
  CollectionBulkWriteOptions,
  CommonOptions,
  FilterQuery,
  FindOneAndDeleteOption,
  FindOneAndReplaceOption,
  FindOneAndUpdateOption,
  FindOneOptions,
  GeoHaystackSearchOptions,
  IndexOptions,
  IndexSpecification,
  MongoCountPreferences,
  MongoDistinctPreferences,
  OptionalId,
  UpdateQuery
} from "mongodb";
import { Database } from ".";

export enum Policy {
  ByPass,
  Nullify,
  Remove,
  RemoveDocument,
  Reject
}

export type ForeignKeyDescriptor = {
  key: string;
  primaryKey: string;
  collection: string;
  policy: Policy;
};

export class Collection<TSchema extends object> {
  database: Database;
  handle: Promise<Col<TSchema>>;
  foreignKeys: Array<ForeignKeyDescriptor>;

  constructor(
    database: Database,
    name: string,
    foreignKeys?: Array<ForeignKeyDescriptor>
  ) {
    this.database = database;
    this.handle = database.handle.then(db => db.collection<TSchema>(name));
    this.foreignKeys = foreignKeys ?? [];
  }

  addForeignKey(foreignKey: ForeignKeyDescriptor) {
    const descriptor = this.foreignKeys.find(
      ({ key }) => key === foreignKey.key
    );
    if (descriptor) Object.assign(descriptor, foreignKey);
    else this.foreignKeys.push(foreignKey);
  }

  createForeignKeys(foreignKeys: Array<ForeignKeyDescriptor>) {
    this.foreignKeys = foreignKeys;
  }

  aggregate<T = TSchema>(
    pipeline?: object[],
    options?: CollectionAggregationOptions
  ) {
    return this.handle.then(col =>
      col.aggregate<T>(pipeline, options).toArray()
    );
  }

  bulkWrite(
    operations: Array<BulkWriteOperation<TSchema>>,
    options?: CollectionBulkWriteOptions
  ) {
    return this.handle.then(col => col.bulkWrite(operations, options));
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

  deleteMany(filter: FilterQuery<TSchema>, options?: CommonOptions) {
    return this.handle.then(col => col.deleteMany(filter, options));
  }

  deleteOne(filter: FilterQuery<TSchema>, options?: CommonOptions) {
    return this.handle.then(col => col.deleteOne(filter, options));
  }

  distinct(
    key: string,
    query?: FilterQuery<TSchema>,
    options?: MongoDistinctPreferences
  ) {
    return this.handle.then(col => col.distinct(key, query, options));
  }

  drop(options?: { session: ClientSession }) {
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

  findOneAndDelete(
    filter: FilterQuery<TSchema>,
    options?: FindOneAndDeleteOption
  ) {
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
}
