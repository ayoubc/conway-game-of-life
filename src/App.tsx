import './App.css';
import { LifeCanvas } from './components/LifeCanvas';
import { ControlPanel } from './components/ControlPanel';
import { GameProvider, useGameContext } from './context/CanvasApiContext';

function ThemedGameScene() {
  const { theme } = useGameContext();

  return (
    <div className={`root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <LifeCanvas />
      <ControlPanel />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <ThemedGameScene />
    </GameProvider>
  );
}

export default App;
