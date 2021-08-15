import { Task } from 'interface';
import type { z } from 'zod';

const TaskArray = Task.array();

const parseAsyncTask = Task.parseAsync.bind(Task);
const parseAsyncTaskArray = TaskArray.parseAsync.bind(TaskArray);
export type AddTaskSchema = Omit<Task, 'id' | 'etag'>;
export type TaskArray = z.infer<typeof TaskArray>;
export class TaskApi {
  protected handleErrors = async (response: Response): Promise<unknown> => {
    if (!response.ok) {
      throw new Error(`${response.statusText} ${await response.text()}`);
    }
    return await response.json();
  };
  getTasks(options: RequestInit = {}) {
    return fetch('/api/v1/tasks', options)
      .then(this.handleErrors)
      .then(parseAsyncTaskArray);
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
