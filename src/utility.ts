import { ObjectId } from "mongodb";

export function substractKeys<T>(keys: Array<T>, alreadyDeleted: Array<T>) {
  const normalizedKey = (key: T) =>
    key instanceof ObjectId ? key.toHexString() : key;
  const set = new Set(alreadyDeleted.map(normalizedKey));
  return keys.filter(key => !set.has(normalizedKey(key)));
}

