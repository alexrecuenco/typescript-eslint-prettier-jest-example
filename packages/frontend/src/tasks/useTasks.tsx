import type { Task } from 'interface';
import { useContext } from 'react';
import type { TaskArray } from './api';
import { TasksContext, TasksDispatchContext } from './TaskContext';

export function useTasks() {
  const tasks = useContext(TasksContext);
  if (!tasks) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return tasks;
}

export function useTasksDispatch() {
  const dispatch = useContext(TasksDispatchContext);

  if (!dispatch) {
    throw new Error('useTasksDispatch must be used within a TasksProvider');
  }

  return {
    addTask: (task: Task) => dispatch({ type: 'added', task }),
    changeTask: (task: Partial<Task>) => dispatch({ type: 'changed', task }),
    deleteTask: (id: number) => dispatch({ type: 'deleted', id }),
    setTasks: (tasks: TaskArray) => dispatch({ type: 'set', tasks }),
  };
}
