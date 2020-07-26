export function map(documents: Array<any>, path: string) {
  const routes = path.split(".");
  return documents.map(doc => routes.reduce((doc, route) => doc?.[route], doc));
}

export function flatten<T>(array: Array<Array<T>>) {
  return array.reduce((acc, subarray) => [...acc, ...subarray], []);
}
