import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

interface PatternRequest {
  id: number;
  name: string;
}

export type GameTheme = 'light' | 'dark';

interface GameContextValue {
  running: boolean;
  setRunning: (running: boolean) => void;
  theme: GameTheme;
  setTheme: (theme: GameTheme) => void;
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
  const [theme, setTheme] = useState<GameTheme>('light');
  const [speedSliderValue, setSpeedSliderValue] = useState(50);
  const [randomizeTick, setRandomizeTick] = useState(0);
  const [clearTick, setClearTick] = useState(0);
  const [patternRequest, setPatternRequest] = useState<PatternRequest | null>(null);

  const value = useMemo<GameContextValue>(() => ({
    running,
    setRunning,
    theme,
    setTheme,
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
  }), [running, theme, speedSliderValue, randomizeTick, clearTick, patternRequest]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
}
