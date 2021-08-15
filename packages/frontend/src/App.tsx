import './App.css';
import reactLogo from './assets/react.svg';
import { TaskWrapper } from './Tasks';
import viteLogo from '/vite.svg';

function App() {
  return (
    <>
      <div className="header">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1>Vite + React + Express + Multi-root</h1>
      </div>
      <TaskWrapper />
    </>
  );
}

export default App;
