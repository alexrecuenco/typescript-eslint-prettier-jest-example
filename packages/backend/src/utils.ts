// # This is a log function debugging purposes
export const log = async <T>(p: Promise<T> | T) => {
  // eslint-disable-next-line @typescript-eslint/return-await
  return Promise.resolve(p).then((o) => {
    // eslint-disable-next-line no-console
    console.log(typeof o, o);
    return o;
  });
};
