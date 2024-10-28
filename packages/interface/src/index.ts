import { z } from 'zod';

export const Task = z.object({
  name: z.string(),
  etag: z.number(),
  id: z.number(),
});

export const exampleTasks: Task[] = [{ name: 'Alice', etag: 1, id: 4 }];

export type Task = z.infer<typeof Task>;
