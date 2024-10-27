export { Task } from 'interface';
import { Task } from 'interface';
import type { z } from 'zod';

const TaskArray = Task.array();

const parseAsyncTask = Task.parseAsync.bind(Task);
const parseAsyncTaskArray = TaskArray.parseAsync.bind(TaskArray);
export type AddTaskSchema = Omit<Task, 'id' | 'etag'>;
export type TaskArray = z.infer<typeof TaskArray>;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response: string | { error: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export class TaskApi {
  protected handleErrors = async (response: Response): Promise<unknown> => {
    if (!response.ok) {
      const message = response.statusText;
      const isJsonResponse = response.headers
        .get('Content-Type')
        ?.includes('application/json');
      let errorResponse: string | { error: unknown };
      try {
        errorResponse = isJsonResponse
          ? { error: (await response.json()) as unknown }
          : await response.text();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse error response', e);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        errorResponse = `failed to parse response ${e}`;
      }

      throw new ApiError(message, response.status, errorResponse);
    }
    return await response.json();
  };
  getTasks(options: RequestInit = {}) {
    return fetch('/api/v1/tasks', options)
      .then(this.handleErrors)
      .then(parseAsyncTaskArray);
  }

  getTask(id: number, options: RequestInit = {}) {
    return fetch(`/api/v1/tasks/${id}`, options)
      .then(this.handleErrors)
      .then(parseAsyncTask);
  }

  addTask(task: AddTaskSchema, options: RequestInit = {}) {
    return fetch('/api/v1/tasks', {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
      .then(this.handleErrors)
      .then(parseAsyncTask);
  }
  deleteTask(id: number, options: RequestInit = {}) {
    return fetch(`/api/v1/tasks/${id}`, {
      ...options,
      method: 'DELETE',
    }).then(this.handleErrors);
  }
  updateTask(task: Task, options: RequestInit = {}) {
    return fetch(`/api/v1/tasks/${task.id}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
      .then(this.handleErrors)
      .then(parseAsyncTask);
  }

  debugPopulate(options: RequestInit = {}) {
    return fetch('/api/v1/tasks/debug/populate', {
      ...options,
      method: 'GET',
    }).then(this.handleErrors);
  }
}
