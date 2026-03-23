import type { Cell, CellKey } from './types';
import { fromCellKey, toCellKey } from './cellKey';

const NEIGHBORS: Cell[] = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1]
];

export class GameEngine {
  private liveCells = new Set<CellKey>();
  private deadCellTraces = new Map<CellKey, number>();
  private static readonly DEAD_TRACE_TTL = 6;

  getCells(): Set<CellKey> {
    return this.liveCells;
  }

  getDeadCellTraces(): Map<CellKey, number> {
    return this.deadCellTraces;
  }

  static getDeadTraceTtl(): number {
    return GameEngine.DEAD_TRACE_TTL;
  }

  hasCell(x: number, y: number): boolean {
    return this.liveCells.has(toCellKey(x, y));
  }

  addCell(x: number, y: number): void {
    const key = toCellKey(x, y);
    this.liveCells.add(key);
    this.deadCellTraces.delete(key);
  }

  removeCell(x: number, y: number): void {
    const key = toCellKey(x, y);
    if (this.liveCells.delete(key)) {
      this.deadCellTraces.set(key, GameEngine.DEAD_TRACE_TTL);
    }
  }

  toggleCell(x: number, y: number): void {
    if (this.hasCell(x, y)) this.removeCell(x, y);
    else this.addCell(x, y);
  }

  clear(): void {
    this.liveCells.clear();
    this.deadCellTraces.clear();
  }

  addPattern(patternCells: Cell[], offsetX: number, offsetY: number): void {
    patternCells.forEach(([x, y]) => this.addCell(x + offsetX, y + offsetY));
  }

  randomizeAround(centerX: number, centerY: number, areaSize = 100, fillPercentage?: number): void {
    const fill = fillPercentage ?? Math.floor(Math.random() * 100);
    const half = Math.floor(areaSize / 2);
    this.liveCells.clear();
    this.deadCellTraces.clear();

    for (let x = centerX - half; x < centerX + half; x++) {
      for (let y = centerY - half; y < centerY + half; y++) {
        if (Math.random() * 100 < fill) this.addCell(x, y);
      }
    }
  }

  step(): void {
    for (const [key, ttl] of this.deadCellTraces.entries()) {
      const nextTtl = ttl - 1;
      if (nextTtl <= 0) this.deadCellTraces.delete(key);
      else this.deadCellTraces.set(key, nextTtl);
    }

    const neighborCounts = new Map<CellKey, number>();

    for (const cellKey of this.liveCells) {
      const [x, y] = fromCellKey(cellKey);
      for (const [dx, dy] of NEIGHBORS) {
        const nKey = toCellKey(x + dx, y + dy);
        neighborCounts.set(nKey, (neighborCounts.get(nKey) || 0) + 1);
      }
    }

    const nextLiveCells = new Set<CellKey>();
    for (const [candidateKey, count] of neighborCounts.entries()) {
      const currentlyAlive = this.liveCells.has(candidateKey);
      if (count === 3 || (currentlyAlive && count === 2)) {
        nextLiveCells.add(candidateKey);
      }
    }

    for (const cellKey of this.liveCells) {
      if (!nextLiveCells.has(cellKey)) {
        this.deadCellTraces.set(cellKey, GameEngine.DEAD_TRACE_TTL);
      }
    }

    for (const cellKey of nextLiveCells) {
      this.deadCellTraces.delete(cellKey);
    }

    this.liveCells = nextLiveCells;
  }
}
