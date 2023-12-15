import { randomUUID } from 'crypto';
import { ErrorRequestHandler, json, Router } from 'express';
import { Task } from 'interface';
import pg from 'pg';
import { z } from 'zod';

const TaskArray = z.array(Task);

const jsonParseErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(400).json({
    message: 'Invalid Input',
    error: formatError(err),
  });
};

const formatError = (err: unknown) => {
  if (err instanceof Error) {
    return `[${err.name}] ${err.message}`;
  }
  return JSON.stringify(err);
};

const zodErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Invalid Input', error: err.errors });
  } else {
    next(err);
  }
};

const unknownErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({
    message: 'Internal Server Error',
    error: formatError(err),
  });
  // TODO: Make this a winston logger
  // eslint-disable-next-line no-console
  console.error(err);
  next();
};
export function taskRouter(client: pg.Pool, router = Router()) {
  router.use(json());

  router.use(jsonParseErrorHandler);

  router.get('/', async (req, res) => {
    const response = await client.query(
      'SELECT * FROM tasks ORDER BY id LIMIT $1::integer ',
      [req.query.limit || 1000],
    );

    const rows = await TaskArray.parseAsync(response.rows);

    res.status(200).json(rows);
  });

  router.get('/:id', async (req, res) => {
    const response = await client.query(
      'SELECT * FROM tasks WHERE id = $1::integer',
      [req.params.id],
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [element] = response.rows;
    if (!element) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    const row = await Task.parseAsync(element);
    res.status(200).json(row);
  });

  router.delete('/:id', async (req, res) => {
    const response = await client.query(
      'DELETE FROM tasks WHERE id = $1::integer',
      [req.params.id],
    );
    res.status(200).json({ rowsDeleted: response.rowCount });
  });

  router.post('/:id', async (req, res) => {
    const task = await Task.parseAsync(req.body);
    const response = await client.query(
      'UPDATE tasks SET name = $1::text, etag = etag + 1 WHERE id = $2::integer AND etag = $3::integer RETURNING etag',
      [task.name, req.params.id, task.etag],
    );

    if (response.rowCount === 0) {
      res.status(409).json({ message: 'Conflict: etag does not match' });
      return;
    }

    const returnedTask = await Task.parseAsync({
      ...req.body,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      etag: response.rows[0].etag,
    });
    res.status(200).json(returnedTask);
  });

  router.post('/', async (req, res) => {
    const task = await Task.omit({ etag: true, id: true }).parseAsync(req.body);
    const result = await client.query(
      'INSERT INTO tasks (name) VALUES ($1::text) RETURNING *',
      [task.name],
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = { ...req.body, ...result.rows[0] };
    res.status(201).send(await Task.parseAsync(response));
  });

  router.get('/debug/populate', async (req, res) => {
    const n = req.query.n;
    let amount = 10;
    if (typeof n === 'string') {
      amount = parseInt(n, 10);
    }
    const [part1, part2] = randomUUID().split('-');

    const promises = Array(amount)
      .fill(0)
      .map((_, i) => {
        return client.query('INSERT INTO tasks (name) VALUES ($1::text)', [
          `Task ${i} — ${part1}, ${part2}`,
        ]);
      });

    const count = (await Promise.all(promises))
      .map((r) => r.rowCount || 0)
      .reduce((a, b) => a + b, 0);

    res.status(200).json({ message: 'Populated', count });
  });

  router.use(zodErrorHandler);
  router.use(unknownErrorHandler);
  return router;
}
