/* eslint-disable no-console */
import { Task } from 'interface';
import { useEffect, useState } from 'react';
import { TaskApi, type AddTaskSchema, type TaskArray } from './api';

const api = new TaskApi();
export function TaskWrapper() {
  const [tasks, setTasks] = useState<TaskArray>([]);
  const [error, setError] = useState<Error | null>(null);
  const processError = (err: Error) => {
    if (err.name === 'AbortError') {
      // ok, expected on dismount
      return;
    }
    console.error(err);
    setError(err);
  };

  useEffect(() => {
    const abort = new AbortController();
    api.getTasks({ signal: abort.signal }).then(setTasks).catch(processError);

    return () => {
      abort.abort();
    };
  }, []);

  const addTask = (task: AddTaskSchema) => {
    api
      .addTask(task)
      .then((newTask) => {
        setTasks([...tasks, newTask]);
      })
      .then(() => setError(null))
      .catch(processError);
  };

  const deleteTask = (id: number) => {
    api
      .deleteTask(id)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
      })
      .then(() => setError(null))
      .catch(processError);
  };

  const updateTask = (task: Task) => {
    api
      .updateTask(task)
      .then((task) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      })
      .then(() => setError(null))
      .catch(processError);
  };

  return (
    <div className="tasks">
      {error && (
        <p className="error">
          [{error.name}] {error.message}
        </p>
      )}
      <div className="heading">
        <RefreshTasks
          refresh={() => {
            api
              .getTasks()
              .then(setTasks)
              .then(() => setError(null))
              .catch(processError);
          }}
        />
        <PopulateTasks
          populate={() => {
            api
              .debugPopulate()
              .then(() => api.getTasks().then(setTasks))
              .then(() => setError(null))
              .catch(processError);
          }}
        />

        <AddTask addTask={addTask} />
      </div>
      <ItemList items={tasks} deleteTask={deleteTask} updateTask={updateTask} />
    </div>
  );
}

function RefreshTasks({ refresh }: { refresh: () => void }) {
  return (
    <button
      className="refresh"
      onClick={() => {
        refresh();
      }}
    >
      Refresh
    </button>
  );
}

function PopulateTasks({ populate }: { populate: () => void }) {
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

function AddTask({ addTask }: { addTask: (task: AddTaskSchema) => void }) {
  const [text, setText] = useState('');
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
          addTask({
            name: text,
          });
          setText('');
        }}
      >
        Add
      </button>
    </>
  );
}

function ItemList({
  items,
  updateTask,
  deleteTask,
}: {
  items: Task[];
  deleteTask: (id: number) => void;
  updateTask: (task: Task) => void;
}) {
  return (
    <div className="items">
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          updateTask={updateTask}
          deleteTask={deleteTask}
        ></Item>
      ))}
    </div>
  );
}

function Item({
  item,
  deleteTask,
  updateTask,
}: {
  item: Task;
  deleteTask: (id: number) => void;
  updateTask: (task: Task) => void;
}) {
  const [editing, setEditing] = useState(false);

  // delete button
  return (
    <div className="task">
      <button
        className="delete"
        onClick={() => {
          deleteTask(item.id);
        }}
      >
        X
      </button>
      {editing ? (
        <EditTask
          key={item.name}
          task={item}
          updateTask={updateTask}
          onDone={() => setEditing(false)}
        />
      ) : (
        <DisplayTask
          key={item.name}
          task={item}
          onClick={() => setEditing(true)}
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
  updateTask,
  onDone,
}: {
  task: Task;
  updateTask: (task: Task) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState(task.name);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim() !== '') {
      updateTask({ ...task, name: text });
      onDone();
    }
  };
  return (
    <div className="item edit">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyUp={handleKeyPress}
      />
    </div>
  );
}
