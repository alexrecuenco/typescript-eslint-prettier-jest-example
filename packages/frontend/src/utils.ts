export const wait =
  (ms: number) =>
  <T>(t: T) =>
    new Promise((resolve) => setTimeout(resolve, ms)).then(() => t);
