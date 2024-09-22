export function replace<T>(
  f: (t: T) => T,
  isTType: (t: any) => t is T,
): <U>(obj: U) => U {
  const recurseApply = (obj: unknown): any => {
    if (isTType(obj)) return f(obj);
    if (obj == null) return obj;
    if (Array.isArray(obj)) return obj.map(recurseApply);
    if (typeof obj === 'object')
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, recurseApply(v)]),
      );
    return obj;
  };
  return recurseApply;
}
