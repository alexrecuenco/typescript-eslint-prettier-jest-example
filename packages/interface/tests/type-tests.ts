import { expectType, expectTypeAssignable } from '@fast-check/expect-type';
import type { ZodSchema } from 'zod';
import { examples, item, type Item } from '../src/index.js';

expectTypeAssignable<ZodSchema>()(item, 'toLowerCase outputs a string');

expectType<Item[]>()(examples, 'toLowerCase outputs a string');
