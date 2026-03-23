import type { CameraState, Cell, CellKey, VisibleBounds } from './types';
import { fromCellKey } from './cellKey';

const LIVE_CELL_COLOR: [number, number, number] = [0, 0, 0];
const DEAD_TRACE_NEAR_COLOR: [number, number, number] = [45, 110, 255];
const DEAD_TRACE_FAR_COLOR: [number, number, number] = [139, 94, 60];
const DEAD_TRACE_BLEND_DISTANCE = 6;
const DEAD_TRACE_MAX_ALPHA = 0.18;
const ENABLE_DEAD_TRACE_DISTANCE_GRADIENT = true;
const ENABLE_DEAD_CELL_FADING = false; // Set to false for better performance on large grids

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rgb(...arr: [number, number, number]): string {
  const [r, g, b] = arr;
  return `rgb(${r}, ${g}, ${b})`;
}

function getDeadTraceColor(cellX: number, cellY: number, liveCells: Set<CellKey>): string {
  if (liveCells.size === 0) {
    return rgb(...DEAD_TRACE_FAR_COLOR);
  }

  let minDistance = Number.POSITIVE_INFINITY;
  for (const liveCellKey of liveCells) {
    const [liveX, liveY] = fromCellKey(liveCellKey);
    const dx = liveX - cellX;
    const dy = liveY - cellY;
    const distance = Math.hypot(dx, dy);
    if (distance < minDistance) {
      minDistance = distance;
      if (minDistance === 0) break;
    }
  }

  const t = Math.min(1, minDistance / DEAD_TRACE_BLEND_DISTANCE);
  const r = Math.round(lerp(DEAD_TRACE_NEAR_COLOR[0], DEAD_TRACE_FAR_COLOR[0], t));
  const g = Math.round(lerp(DEAD_TRACE_NEAR_COLOR[1], DEAD_TRACE_FAR_COLOR[1], t));
  const b = Math.round(lerp(DEAD_TRACE_NEAR_COLOR[2], DEAD_TRACE_FAR_COLOR[2], t));
  return rgb(r, g, b);
}

function renderDeadCellTraces(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: CameraState,
  bounds: VisibleBounds,
  liveCells: Set<CellKey>,
  deadCellTraces: Map<CellKey, number>,
  deadTraceTtl: number
): void {
  for (const [cellKey, ttl] of deadCellTraces.entries()) {
    const [x, y] = fromCellKey(cellKey);
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) continue;

    const [sx, sy] = worldToScreen(x, y, camera, canvas);
    const alpha = (ttl / deadTraceTtl) * DEAD_TRACE_MAX_ALPHA;

    if (ENABLE_DEAD_TRACE_DISTANCE_GRADIENT) {
      const deadTraceColor = getDeadTraceColor(x, y, liveCells);
      ctx.fillStyle = deadTraceColor.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    } else {
      ctx.fillStyle = `rgba(${DEAD_TRACE_NEAR_COLOR[0]}, ${DEAD_TRACE_NEAR_COLOR[1]}, ${DEAD_TRACE_NEAR_COLOR[2]}, ${alpha})`;
    }

    ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(camera.cellSize), Math.ceil(camera.cellSize));
  }
}

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

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: CameraState,
  liveCells: Set<CellKey>,
  deadCellTraces?: Map<CellKey, number>,
  deadTraceTtl = 1
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

  if (deadCellTraces && deadTraceTtl > 0 && ENABLE_DEAD_CELL_FADING) {
    renderDeadCellTraces(ctx, canvas, camera, bounds, liveCells, deadCellTraces, deadTraceTtl);
  }

  ctx.fillStyle = rgb(...LIVE_CELL_COLOR);
  for (const cellKey of liveCells) {
    const [x, y] = fromCellKey(cellKey);
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) continue;
    const [sx, sy] = worldToScreen(x, y, camera, canvas);
    ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(camera.cellSize), Math.ceil(camera.cellSize));
  }
}
