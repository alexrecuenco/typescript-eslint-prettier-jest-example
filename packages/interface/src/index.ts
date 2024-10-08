import { z } from 'zod';

export const item = z.object({
  name: z.string(),
  age: z.number(),
  id: z.string(),
  other: z.string(),
});

export const examples: Item[] = [
  { name: 'Alice', age: 21, id: '1', other: 'foo' },
];

export type Item = z.infer<typeof item>;
