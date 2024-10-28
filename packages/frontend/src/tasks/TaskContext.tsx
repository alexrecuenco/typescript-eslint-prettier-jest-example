import { createContext, useReducer } from 'react';
import type { Task, TaskArray } from './api';

export const TasksContext = createContext<TaskArray | null>(null);

type TaskReducerAction =
  | {
      type: 'added';
      task: Task;
    }
  | {
      type: 'changed';
      task: Partial<Task>;
    }
  | {
      type: 'deleted';
      id: number;
    }
  | {
      type: 'set';
      tasks: TaskArray;
    };

export const TasksDispatchContext =
  createContext<React.Dispatch<TaskReducerAction> | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}

function tasksReducer(tasks: TaskArray, action: TaskReducerAction): TaskArray {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          ...action.task,
        },
      ];
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return { ...t, ...action.task };
        }
        return t;
      });
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
    case 'set': {
      return action.tasks;
    }
    default: {
      throw Error('Unreachable');
    }
  }
}
