export function isObjectKey<T extends Record<string, any>>(obj: T, maybeKey: string | number | symbol): maybeKey is keyof T {
  return Object.keys(obj).includes(maybeKey as string);
}
