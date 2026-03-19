const COLOR = 'black';
const NEIGHBORS = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1]
];

let speed = 0.2; // seconds per generation
let started = false;
let interval;
let randomAreaSize = 100;

let liveCells = new Set(); // key format: "x,y"

let canvas;
let ctx;

let cameraX = 25;
let cameraY = 25;
let cellSize = 10;
const MIN_CELL_SIZE = 2;
const MAX_CELL_SIZE = 60;

let isDragging = false;
let dragMoved = false;
let dragStartX = 0;
let dragStartY = 0;
let cameraStartX = 0;
let cameraStartY = 0;

document.addEventListener('DOMContentLoaded', runApp);

function runApp() {
  canvas = document.querySelector('#life-canvas');
  ctx = canvas.getContext('2d');

  const startBtn = document.querySelector('.start-btn');
  const randomBtn = document.querySelector('.random-btn');
  const dimensionBtn = document.querySelector('.grid-dim-btn');
  const dimensionInput = document.querySelector('#dimension');
  const speedSlider = document.querySelector('#speed-slider');
  const patternSelect = document.querySelector('#patterns');
  const controlPanel = document.querySelector('#control-panel');
  const panelDragHandle = document.querySelector('#panel-drag-handle');

  function key(x, y) {
    return `${x},${y}`;
  }

  function parseKey(cellKey) {
    const [x, y] = cellKey.split(',').map(Number);
    return [x, y];
  }

  function hasCell(x, y) {
    return liveCells.has(key(x, y));
  }

  function addCell(x, y) {
    liveCells.add(key(x, y));
  }

  function removeCell(x, y) {
    liveCells.delete(key(x, y));
  }

  function toggleCell(x, y) {
    if (hasCell(x, y)) removeCell(x, y);
    else addCell(x, y);
  }

  function resizeCanvasToDisplaySize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function worldToScreen(wx, wy) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    return [
      (wx - cameraX) * cellSize + width / 2,
      (wy - cameraY) * cellSize + height / 2
    ];
  }

  function screenToWorld(sx, sy) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    return [
      Math.floor((sx - width / 2) / cellSize + cameraX),
      Math.floor((sy - height / 2) / cellSize + cameraY)
    ];
  }

  function getVisibleWorldBounds() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const minX = Math.floor(cameraX - width / (2 * cellSize)) - 1;
    const maxX = Math.ceil(cameraX + width / (2 * cellSize)) + 1;
    const minY = Math.floor(cameraY - height / (2 * cellSize)) - 1;
    const maxY = Math.ceil(cameraY + height / (2 * cellSize)) + 1;
    return { minX, maxX, minY, maxY };
  }

  function render() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#e9e9e9';
    ctx.fillRect(0, 0, width, height);

    const bounds = getVisibleWorldBounds();

    if (cellSize >= 4) {
      // Minor grid lines
      ctx.strokeStyle = '#b8b8b8';
      ctx.lineWidth = 1;
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x % 10 === 0) continue;
        const [sx] = worldToScreen(x, 0);
        ctx.beginPath();
        ctx.moveTo(Math.floor(sx) + 0.5, 0);
        ctx.lineTo(Math.floor(sx) + 0.5, height);
        ctx.stroke();
      }
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        if (y % 10 === 0) continue;
        const [, sy] = worldToScreen(0, y);
        ctx.beginPath();
        ctx.moveTo(0, Math.floor(sy) + 0.5);
        ctx.lineTo(width, Math.floor(sy) + 0.5);
        ctx.stroke();
      }

      // Major (bold) grid lines every 10 cells
      ctx.strokeStyle = '#8f8f8f';
      ctx.lineWidth = 1.2;
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x % 10 !== 0) continue;
        const [sx] = worldToScreen(x, 0);
        ctx.beginPath();
        ctx.moveTo(Math.floor(sx) + 0.5, 0);
        ctx.lineTo(Math.floor(sx) + 0.5, height);
        ctx.stroke();
      }
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        if (y % 10 !== 0) continue;
        const [, sy] = worldToScreen(0, y);
        ctx.beginPath();
        ctx.moveTo(0, Math.floor(sy) + 0.5);
        ctx.lineTo(width, Math.floor(sy) + 0.5);
        ctx.stroke();
      }
    }

    ctx.fillStyle = COLOR;
    for (const cellKey of liveCells) {
      const [x, y] = parseKey(cellKey);
      if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
        continue;
      }
      const [sx, sy] = worldToScreen(x, y);
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(cellSize), Math.ceil(cellSize));
    }
  }

  function step() {
    const neighborCounts = new Map();

    for (const cellKey of liveCells) {
      const [x, y] = parseKey(cellKey);
      for (const [dx, dy] of NEIGHBORS) {
        const nKey = key(x + dx, y + dy);
        neighborCounts.set(nKey, (neighborCounts.get(nKey) || 0) + 1);
      }
    }

    const nextLiveCells = new Set();

    for (const [candidateKey, count] of neighborCounts.entries()) {
      const currentlyAlive = liveCells.has(candidateKey);
      if (count === 3 || (currentlyAlive && count === 2)) {
        nextLiveCells.add(candidateKey);
      }
    }

    liveCells = nextLiveCells;
  }

  function playGame() {
    clearInterval(interval);
    interval = setInterval(() => {
      step();
      render();
    }, speed * 1000);
  }

  function stopGame() {
    clearInterval(interval);
  }

  function addPattern(patternCells, offsetX, offsetY) {
    patternCells.forEach(([x, y]) => addCell(x + offsetX, y + offsetY));
  }

  function seedDefaultPatterns() {
    const cx = Math.floor(cameraX);
    const cy = Math.floor(cameraY);

    // addPattern(PATTERNS['blinker'].cells, cx, cy);
    // addPattern(PATTERNS['boat'].cells, cx + 5, cy);
    // addPattern(PATTERNS['pulsar'].cells, cx + 9, cy);
    addPattern(PATTERNS['gosperGlidingGun'].cells, cx + 12, cy + 20);
    // addPattern(PATTERNS['lightWeithSpaceShip'].cells, cx + 40, cy + 25);
    // addPattern(PATTERNS['pentadecathlon'].cells(5), cx + 45, cy + 50);
    // addPattern(PATTERNS['pentadecathlon'].cells(10), cx + 60, cy + 40);
  }

  function randomizeAroundCamera(areaSize, fillPercentage = null) {
    const fill = fillPercentage ?? Math.floor(Math.random() * 100);
    const half = Math.floor(areaSize / 2);
    const centerX = Math.floor(cameraX);
    const centerY = Math.floor(cameraY);
    liveCells.clear();

    for (let x = centerX - half; x < centerX + half; x++) {
      for (let y = centerY - half; y < centerY + half; y++) {
        if (Math.random() * 100 < fill) addCell(x, y);
      }
    }

    render();
  }

  startBtn.addEventListener('click', function () {
    if (started) {
      started = false;
      this.textContent = 'Start';
      stopGame();
    } else {
      started = true;
      this.textContent = 'Stop';
      playGame();
    }
  });

  randomBtn.addEventListener('click', function () {
    randomizeAroundCamera(randomAreaSize);
  });

  dimensionBtn.addEventListener('click', function () {
    randomAreaSize = Math.max(10, Number(dimensionInput.value) || 100);
  });

  for (const keyName in PATTERNS) {
    const option = document.createElement('option');
    option.textContent = PATTERNS[keyName].name;
    option.classList.add(keyName);
    patternSelect.appendChild(option);
  }

  patternSelect.addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex].classList[0];
    const centerX = Math.floor(cameraX);
    const centerY = Math.floor(cameraY);
    let cells;

    if (selectedOption === 'pentadecathlon') {
      const length = parseInt(window.prompt('Length of Pentadecathlon ?', '10'), 10) || 10;
      cells = PATTERNS[selectedOption].cells(length);
    } else {
      cells = PATTERNS[selectedOption].cells;
    }

    addPattern(cells, centerX, centerY);
    render();
  });

  speedSlider.addEventListener('change', function () {
    speed = 1 / this.value;
    if (started) playGame();
  });

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    const [beforeX, beforeY] = screenToWorld(sx, sy);

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    cellSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, cellSize * zoomFactor));

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    cameraX = beforeX - (sx - width / 2) / cellSize;
    cameraY = beforeY - (sy - height / 2) / cellSize;
    render();
  }, { passive: false });

  canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    cameraStartX = cameraX;
    cameraStartY = cameraY;
  });

  window.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;

    cameraX = cameraStartX - dx / cellSize;
    cameraY = cameraStartY - dy / cellSize;
    render();
  });

  window.addEventListener('mouseup', (event) => {
    if (!isDragging) return;
    isDragging = false;

    if (!dragMoved) {
      const rect = canvas.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      if (sx >= 0 && sy >= 0 && sx <= rect.width && sy <= rect.height) {
        const [x, y] = screenToWorld(sx, sy);
        toggleCell(x, y);
        render();
      }
    }
  });

  panelDragHandle.addEventListener('mousedown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    isPanelDragging = true;

    const panelRect = controlPanel.getBoundingClientRect();
    panelDragOffsetX = event.clientX - panelRect.left;
    panelDragOffsetY = event.clientY - panelRect.top;
  });

  window.addEventListener('mousemove', (event) => {
    if (!isPanelDragging) return;

    const panelRect = controlPanel.getBoundingClientRect();
    const maxLeft = window.innerWidth - panelRect.width;
    const maxTop = window.innerHeight - panelRect.height;

    const nextLeft = Math.max(0, Math.min(maxLeft, event.clientX - panelDragOffsetX));
    const nextTop = Math.max(0, Math.min(maxTop, event.clientY - panelDragOffsetY));

    controlPanel.style.left = `${nextLeft}px`;
    controlPanel.style.top = `${nextTop}px`;
  });

  window.addEventListener('mouseup', () => {
    isPanelDragging = false;
  });

  window.addEventListener('resize', resizeCanvasToDisplaySize);

  seedDefaultPatterns();
  resizeCanvasToDisplaySize();
}