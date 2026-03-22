import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { PATTERNS } from '../game/patterns';
import { useGameContext } from '../context/CanvasApiContext';

export function ControlPanel() {
  const {
    running,
    setRunning,
    speedSliderValue,
    setSpeedSliderValue,
    requestRandomize,
    requestClear,
    requestAddPattern
  } = useGameContext();
  const [selectedPatternName, setSelectedPatternName] = useState(PATTERNS.gosperGlidingGun.name);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const isPanelDraggingRef = useRef(false);
  const panelDragOffsetRef = useRef<[number, number]>([0, 0]);

  const toggleRun = () => {
    setRunning(!running);
  };

  const onPanelHandleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    isPanelDraggingRef.current = true;
    const panelRect = panel.getBoundingClientRect();
    panelDragOffsetRef.current = [event.clientX - panelRect.left, event.clientY - panelRect.top];

    const onMove = (e: MouseEvent) => {
      if (!isPanelDraggingRef.current) return;
      const panelRectNow = panel.getBoundingClientRect();
      const maxLeft = window.innerWidth - panelRectNow.width;
      const maxTop = window.innerHeight - panelRectNow.height;
      const nextLeft = Math.max(0, Math.min(maxLeft, e.clientX - panelDragOffsetRef.current[0]));
      const nextTop = Math.max(0, Math.min(maxTop, e.clientY - panelDragOffsetRef.current[1]));
      panel.style.left = `${nextLeft}px`;
      panel.style.top = `${nextTop}px`;
    };

    const onUp = () => {
      isPanelDraggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="control-panel" ref={panelRef}>
      <div className="panel-header" onMouseDown={onPanelHandleMouseDown}>
        Conway&apos;s Game of Life
      </div>

      <button className="start-btn mar-btm" onClick={toggleRun}>{running ? 'Stop' : 'Start'}</button>
      <button className="random-btn mar-btm" onClick={requestRandomize}>Random Grid</button>
      <button className="clear-btn mar-btm" onClick={requestClear}>Clear</button>

      <div className="patterns-list mar-btm">
        <label htmlFor="patterns">Choose a patterns:</label>
        <select
          className="radius-brdr"
          name="patterns"
          id="patterns"
          value={selectedPatternName}
          onChange={(e) => {
            const name = e.target.value;
            setSelectedPatternName(name);
            requestAddPattern(name);
          }}
        >
          {Object.entries(PATTERNS).map(([keyName, pattern]) => (
            <option key={keyName} className={keyName} value={pattern.name}>{pattern.name}</option>
          ))}
        </select>
      </div>

      <div className="speed-slider">
        <label htmlFor="speed-slider">Speed:</label>
        <input
          type="range"
          id="speed-slider"
          min={1}
          max={100}
          value={speedSliderValue}
          onChange={(e) => {
            const value = Number(e.target.value);
            setSpeedSliderValue(value);
          }}
        />
      </div>

      <small>Tip: drag canvas to pan, mouse wheel to zoom, click a cell to toggle. Drag this panel by its header.</small>
    </div>
  );
}
