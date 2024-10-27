/* eslint-disable no-console */
import { Task } from 'interface';
import { useEffect, useState } from 'react';
import { LuRefreshCw } from 'react-icons/lu';
import { MdDeleteForever } from 'react-icons/md';

import { wait } from '../utils';
import { ApiError, TaskApi, type AddTaskSchema } from './api';
import { TasksProvider } from './TaskContext';
import './Tasks.css';
import { useTasks, useTasksDispatch } from './useTasks';

const api = new TaskApi();

const wrapSetError =
  (setError: (error: Error | null) => void) => (err: Error) => {
    if (err.name === 'AbortError') {
      // ok, expected on dismount
      return;
    }
    console.error(err);
    setError(err);
  };

export function TaskApp() {
  return (
    <TasksProvider>
      <div className="tasks">
        <TaskHeader />
        <TaskList />
      </div>
    </TasksProvider>
  );
}

function TaskHeader() {
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className="task-header">
      {error && (
        <p className="error">
          [{error.name}] {error.message}
        </p>
      )}
      <TaskSync setError={setError} />
      <PopulateTasks setError={setError} />
      <AddTask setError={setError} />
    </div>
  );
}

function TaskSync({ setError }: { setError: (error: Error | null) => void }) {
  const { setTasks } = useTasksDispatch();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    api
      .getTasks({ signal: controller.signal })
      .then(wait(500))
      .then(setTasks)
      .catch(wrapSetError(setError))
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [setError, setTasks, refreshKey]);

  console.log('loading rendered', loading);

  return (
    <>
      <button className="refresh" onClick={refresh}>
        <LuRefreshCw className={loading ? 'loading' : 'loaded'} />
      </button>
    </>
  );
}

function PopulateTasks({
  setError,
}: {
  setError: (error: Error | null) => void;
}) {
  const { setTasks } = useTasksDispatch();

  const populate = () => {
    api
      .debugPopulate()
      .then(() => api.getTasks().then(setTasks))
      .then(() => setError(null))
      .catch(wrapSetError(setError));
  };
  return (
    <label htmlFor="populate">
      <button
        aria-label="Add random tasks"
        id="populate"
        className="populate"
        onClick={() => {
          populate();
        }}
      >
        Populate
      </button>
    </label>
  );
}

function AddTask({ setError }: { setError: (error: Error | null) => void }) {
  const [text, setText] = useState('');
  const { addTask: addTaskToApp } = useTasksDispatch();
  const addTask = (task: AddTaskSchema) => {
    api
      .addTask(task)
      .then(addTaskToApp)
      .then(() => setError(null))
      .catch(wrapSetError(setError));
  };
  return (
    <>
      <label htmlFor="task">
        <input
          className="add"
          id="task"
          placeholder="Add task"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        className="add"
        aria-label="Add task"
        onClick={() => {
          addTask({ name: text });
          setText('');
        }}
      >
        Add
      </button>
    </>
  );
}

function TaskList() {
  const tasks = useTasks();

  return (
    <div className="list">
      {tasks.map((task) => (
        <Item key={task.id} item={task}></Item>
      ))}
    </div>
  );
}

function Item({ item }: { item: Task }) {
  const [error, setError] = useState<Error | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  const { deleteTask: deleteTaskInApp } = useTasksDispatch();
  const deleteTask = (id: number) => {
    api
      .deleteTask(id)
      .then(() => {
        deleteTaskInApp(id);
      })
      .catch(wrapSetError(setError));
  };

  // delete button
  return (
    <div className="task-wrapper">
      {error && (
        <p className="error">
          [{error.name}] {error.message}
        </p>
      )}
      <button
        className="delete"
        onClick={() => {
          deleteTask(item.id);
        }}
      >
        <MdDeleteForever />
      </button>
      {editing ? (
        <EditTask
          key={item.name}
          task={item}
          onError={setError}
          onDone={() => setEditing(false)}
        />
      ) : (
        <DisplayTask
          key={item.name}
          task={item}
          onClick={() => {
            setEditing(true);
          }}
        />
      )}
    </div>
  );
}

function DisplayTask({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div className="item display" onClick={onClick}>
      <p>{task.name}</p>
    </div>
  );
}
function EditTask({
  task,
  onError,
  onDone,
}: {
  task: Task;
  onError: (error: Error | null) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState(task.name);

  const [conflictTask, setConflictTask] = useState<Task | null>(null);
  const { changeTask } = useTasksDispatch();

  const updateTask = (task: Task) => {
    return api
      .updateTask(task)
      .then(changeTask)
      .then(() => onError(null))
      .then(() => setConflictTask(null))
      .catch(async (err) => {
        if (err instanceof ApiError && err.status === 409) {
          await api.getTask(task.id).then(setConflictTask);
        }
        throw err;
      });
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim() !== '') {
      updateTask({ ...task, name: text })
        .then(onDone)
        .catch(wrapSetError(onError));
    }
  };
  return (
    <>
      <div className="item edit">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyUp={handleKeyPress}
        />
      </div>
      {conflictTask && (
        <div className="item conflict">
          <p>Conflict: {conflictTask.name}</p>
          <button
            onClick={() => {
              updateTask({ ...task, name: text, etag: conflictTask.etag })
                .then(onDone)
                .catch(wrapSetError(onError));
            }}
          >
            Overwrite?
          </button>
        </div>
      )}
    </>
  );
}
