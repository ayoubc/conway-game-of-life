import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { MAX_CELL_SIZE, MIN_CELL_SIZE, renderGrid, resizeCanvasToDisplaySize, screenToWorld } from '../game/renderer';
import { PATTERNS } from '../game/patterns';
import type { CameraState, Cell } from '../game/types';
import { useGameContext } from '../context/CanvasApiContext';

export function LifeCanvas() {
  const { running, speedSliderValue, randomizeTick, clearTick, patternRequest } = useGameContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef(new GameEngine());
  const cameraRef = useRef<CameraState>({ x: 25, y: 25, cellSize: 10 });
  const intervalRef = useRef<number | null>(null);
  const speedSecondsRef = useRef(0.02);
  const prevRandomizeTickRef = useRef(0);
  const prevClearTickRef = useRef(0);
  const prevPatternRequestIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef<Cell>([0, 0]);
  const cameraStartRef = useRef<Cell>([0, 0]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderGrid(ctx, canvas, cameraRef.current, engineRef.current.getCells());
  };

  const stopGame = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playGame = () => {
    stopGame();
    intervalRef.current = window.setInterval(() => {
      engineRef.current.step();
      render();
    }, speedSecondsRef.current * 1000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      resizeCanvasToDisplaySize(canvas, ctx);
      render();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      const [beforeX, beforeY] = screenToWorld(sx, sy, cameraRef.current, canvas);
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

      cameraRef.current.cellSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, cameraRef.current.cellSize * zoomFactor));
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      cameraRef.current.x = beforeX - (sx - width / 2) / cameraRef.current.cellSize;
      cameraRef.current.y = beforeY - (sy - height / 2) / cameraRef.current.cellSize;
      render();
    };

    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      dragMovedRef.current = false;
      dragStartRef.current = [event.clientX, event.clientY];
      cameraStartRef.current = [cameraRef.current.x, cameraRef.current.y];
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = event.clientX - dragStartRef.current[0];
      const dy = event.clientY - dragStartRef.current[1];
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMovedRef.current = true;

      cameraRef.current.x = cameraStartRef.current[0] - dx / cameraRef.current.cellSize;
      cameraRef.current.y = cameraStartRef.current[1] - dy / cameraRef.current.cellSize;
      render();
    };

    const onMouseUp = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (dragMovedRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      if (sx < 0 || sy < 0 || sx > rect.width || sy > rect.height) return;

      const [x, y] = screenToWorld(sx, sy, cameraRef.current, canvas);
      engineRef.current.toggleCell(x, y);
      render();
    };

    const cx = Math.floor(cameraRef.current.x);
    const cy = Math.floor(cameraRef.current.y);
    engineRef.current.addPattern(PATTERNS.gosperGlidingGun.cells as Cell[], cx + 12, cy + 20);

    window.addEventListener('resize', resize);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    resize();

    return () => {
      stopGame();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (running) playGame();
    else stopGame();
  }, [running]);

  useEffect(() => {
    speedSecondsRef.current = 1 / speedSliderValue;
    if (running) playGame();
  }, [speedSliderValue, running]);

  useEffect(() => {
    if (randomizeTick === prevRandomizeTickRef.current) return;
    prevRandomizeTickRef.current = randomizeTick;

    while (true) {
      const input = window.prompt('Grid size (positive integer)?', '100');
      if (input === null) return;
      const size = Number.parseInt(input, 10);
      if (Number.isInteger(size) && size > 0) {
        engineRef.current.randomizeAround(Math.floor(cameraRef.current.x), Math.floor(cameraRef.current.y), size);
        render();
        return;
      }
      window.alert('Please enter a positive integer !');
    }
  }, [randomizeTick]);

  useEffect(() => {
    if (clearTick === prevClearTickRef.current) return;
    prevClearTickRef.current = clearTick;
    stopGame();
    engineRef.current.clear();
    render();
  }, [clearTick]);

  useEffect(() => {
    if (!patternRequest) return;
    if (patternRequest.id === prevPatternRequestIdRef.current) return;
    prevPatternRequestIdRef.current = patternRequest.id;

    const entry = Object.values(PATTERNS).find((pattern) => pattern.name === patternRequest.name);
    if (!entry) return;

    let cells: Cell[];
    if (entry.name === 'Pentadecathlon') {
      const length = parseInt(window.prompt('Length of Pentadecathlon ?', '10') || '10', 10) || 10;
      cells = (entry.cells as (length: number) => Cell[])(length);
    } else {
      cells = entry.cells as Cell[];
    }

    engineRef.current.addPattern(cells, Math.floor(cameraRef.current.x), Math.floor(cameraRef.current.y));
    render();
  }, [patternRequest]);

  return <canvas className="grid" id="life-canvas" ref={canvasRef}></canvas>;
}
