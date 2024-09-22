import { replace } from '@/replacer.js';
import fc, { Arbitrary } from 'fast-check';

const EachSimpleType = [
  ['string', fc.string()],
  ['integers', fc.integer()],
] as const;

describe.each(EachSimpleType)(
  'Simple replacements works for %p',
  (_, arb: Arbitrary<any>) => {
    test('Should replace simple types', () => {
      fc.assert(
        fc.property(arb, fc.func(arb), (s, f) => {
          return replace(f, (t: string): t is any => true)(s) === f(s);
        }),
      );
    });
  },
);

describe.each(EachSimpleType)(
  'Simple replacements works for arrays of %p',
  (_, arb: Arbitrary<any>) => {
    test('Should replace only elements', () => {
      fc.assert(
        fc.property(fc.array(arb), fc.func(arb), (arr, f) => {
          const obtainedResult = replace(
            f,
            (t): t is any => !Array.isArray(t),
          )(arr);
          const realResult = arr.map((v) => f(v));
          expect(obtainedResult).toStrictEqual(realResult);
        }),
      );
    });
  },
);

describe.each(EachSimpleType)(
  'Simple replacements works for objects of %p',
  (_, arb: Arbitrary<any>) => {
    test('Should replace only properties', () => {
      fc.assert(
        fc.property(fc.dictionary(fc.string(), arb), fc.func(arb), (obj, f) => {
          const realResult = Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, f(v)]),
          );
          const obtainedResult = replace(
            f,
            (t): t is any => !Array.isArray(t) && typeof t !== 'object',
          )(obj);

          expect(obtainedResult).toStrictEqual(realResult);
        }),
      );
    });
  },
);

describe('Ignoring values', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const f = (v: any) => {
    throw new Error();
  };
  test('should leave json objects alone', () => {
    const throwOnReplace = replace(f, (t): t is any => false);
    fc.assert(
      fc.property(fc.json(), (json) => {
        expect(() =>
          expect(throwOnReplace(json)).toStrictEqual(json),
        ).not.toThrow();
      }),
    );
  });

  test('Should leave numbers unchanged when searching for strings', () => {
    const throwOnReplace = replace(
      f,
      (t): t is string => typeof t === 'string',
    );
    const objectArbitrary = fc.object({
      maxDepth: 4,
      withTypedArray: true,
      values: [fc.integer()],
    });
    fc.assert(
      fc.property(objectArbitrary, (obj) => {
        expect(() => throwOnReplace(obj)).not.toThrow();
      }),
    );
  });
});
