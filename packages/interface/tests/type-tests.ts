import { expectType, expectTypeAssignable } from '@fast-check/expect-type';
import type { ZodSchema } from 'zod';
import { exampleTasks, Task } from '../src/index.js';

expectTypeAssignable<ZodSchema>()(Task, 'toLowerCase outputs a string');

expectType<Task[]>()(exampleTasks, 'toLowerCase outputs a string');
