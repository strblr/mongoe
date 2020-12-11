import { ObjectId } from "mongodb";

export { ObjectId };

export function idify(str: null | undefined): null;

export function idify(str: string): ObjectId;

export function idify(str: string | null | undefined): ObjectId | null;

export function idify(str: string | null | undefined): ObjectId | null {
  if (typeof str !== "string") return null;
  if (!ObjectId.isValid(str))
    throw new Error(`Invalid hex value <${str}> passed to idify`);
  return ObjectId.createFromHexString(str);
}

export function substractKeys<T>(keys: Array<T>, alreadyDeleted: Array<T>) {
  const normalizedKey = (key: T) =>
    key instanceof ObjectId ? key.toHexString() : key;
  const set = new Set(alreadyDeleted.map(normalizedKey));
  return keys.filter(key => !set.has(normalizedKey(key)));
}
