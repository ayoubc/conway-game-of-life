import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

interface PatternRequest {
  id: number;
  name: string;
}

interface GameContextValue {
  running: boolean;
  setRunning: (running: boolean) => void;
  speedSliderValue: number;
  setSpeedSliderValue: (value: number) => void;
  randomizeTick: number;
  requestRandomize: () => void;
  clearTick: number;
  requestClear: () => void;
  patternRequest: PatternRequest | null;
  requestAddPattern: (name: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const [running, setRunning] = useState(false);
  const [speedSliderValue, setSpeedSliderValue] = useState(50);
  const [randomizeTick, setRandomizeTick] = useState(0);
  const [clearTick, setClearTick] = useState(0);
  const [patternRequest, setPatternRequest] = useState<PatternRequest | null>(null);

  const value = useMemo<GameContextValue>(() => ({
    running,
    setRunning,
    speedSliderValue,
    setSpeedSliderValue,
    randomizeTick,
    requestRandomize: () => setRandomizeTick((v) => v + 1),
    clearTick,
    requestClear: () => {
      setRunning(false);
      setClearTick((v) => v + 1);
    },
    patternRequest,
    requestAddPattern: (name: string) => {
      setPatternRequest((prev) => ({ id: (prev?.id ?? 0) + 1, name }));
    }
  }), [running, speedSliderValue, randomizeTick, clearTick, patternRequest]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
}
