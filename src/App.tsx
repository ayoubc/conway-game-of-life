import './App.css';
import { LifeCanvas } from './components/LifeCanvas';
import { ControlPanel } from './components/ControlPanel';
import { GameProvider } from './context/CanvasApiContext';

function App() {
  return (
    <GameProvider>
      <div className="root">
        <LifeCanvas />
        <ControlPanel />
      </div>
    </GameProvider>
  );
}

export default App;
