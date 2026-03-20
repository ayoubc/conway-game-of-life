import type { CameraState, Cell, CellKey, VisibleBounds } from './types';

const COLOR = 'black';

export const MIN_CELL_SIZE = 2;
export const MAX_CELL_SIZE = 60;

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function worldToScreen(wx: number, wy: number, camera: CameraState, canvas: HTMLCanvasElement): Cell {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  return [
    (wx - camera.x) * camera.cellSize + width / 2,
    (wy - camera.y) * camera.cellSize + height / 2
  ];
}

export function screenToWorld(sx: number, sy: number, camera: CameraState, canvas: HTMLCanvasElement): Cell {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  return [
    Math.floor((sx - width / 2) / camera.cellSize + camera.x),
    Math.floor((sy - height / 2) / camera.cellSize + camera.y)
  ];
}

export function getVisibleWorldBounds(camera: CameraState, canvas: HTMLCanvasElement): VisibleBounds {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const minX = Math.floor(camera.x - width / (2 * camera.cellSize)) - 1;
  const maxX = Math.ceil(camera.x + width / (2 * camera.cellSize)) + 1;
  const minY = Math.floor(camera.y - height / (2 * camera.cellSize)) - 1;
  const maxY = Math.ceil(camera.y + height / (2 * camera.cellSize)) + 1;
  return { minX, maxX, minY, maxY };
}

function parseKey(cellKey: CellKey): Cell {
  const [x, y] = cellKey.split(',').map(Number);
  return [x, y];
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: CameraState,
  liveCells: Set<CellKey>
): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#e9e9e9';
  ctx.fillRect(0, 0, width, height);

  const bounds = getVisibleWorldBounds(camera, canvas);

  if (camera.cellSize >= 4) {
    ctx.strokeStyle = '#b8b8b8';
    ctx.lineWidth = 1;
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      if (x % 10 === 0) continue;
      const [sx] = worldToScreen(x, 0, camera, canvas);
      ctx.beginPath();
      ctx.moveTo(Math.floor(sx) + 0.5, 0);
      ctx.lineTo(Math.floor(sx) + 0.5, height);
      ctx.stroke();
    }
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      if (y % 10 === 0) continue;
      const [, sy] = worldToScreen(0, y, camera, canvas);
      ctx.beginPath();
      ctx.moveTo(0, Math.floor(sy) + 0.5);
      ctx.lineTo(width, Math.floor(sy) + 0.5);
      ctx.stroke();
    }

    ctx.strokeStyle = '#8f8f8f';
    ctx.lineWidth = 1.2;
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      if (x % 10 !== 0) continue;
      const [sx] = worldToScreen(x, 0, camera, canvas);
      ctx.beginPath();
      ctx.moveTo(Math.floor(sx) + 0.5, 0);
      ctx.lineTo(Math.floor(sx) + 0.5, height);
      ctx.stroke();
    }
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      if (y % 10 !== 0) continue;
      const [, sy] = worldToScreen(0, y, camera, canvas);
      ctx.beginPath();
      ctx.moveTo(0, Math.floor(sy) + 0.5);
      ctx.lineTo(width, Math.floor(sy) + 0.5);
      ctx.stroke();
    }
  }

  ctx.fillStyle = COLOR;
  for (const cellKey of liveCells) {
    const [x, y] = parseKey(cellKey);
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) continue;
    const [sx, sy] = worldToScreen(x, y, camera, canvas);
    ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(camera.cellSize), Math.ceil(camera.cellSize));
  }
}
