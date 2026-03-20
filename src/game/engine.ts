import type { Cell, CellKey } from './types';

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

  private key(x: number, y: number): CellKey {
    return `${x},${y}`;
  }

  private parseKey(cellKey: CellKey): Cell {
    const [x, y] = cellKey.split(',').map(Number);
    return [x, y];
  }

  getCells(): Set<CellKey> {
    return this.liveCells;
  }

  hasCell(x: number, y: number): boolean {
    return this.liveCells.has(this.key(x, y));
  }

  addCell(x: number, y: number): void {
    this.liveCells.add(this.key(x, y));
  }

  removeCell(x: number, y: number): void {
    this.liveCells.delete(this.key(x, y));
  }

  toggleCell(x: number, y: number): void {
    if (this.hasCell(x, y)) this.removeCell(x, y);
    else this.addCell(x, y);
  }

  clear(): void {
    this.liveCells.clear();
  }

  addPattern(patternCells: Cell[], offsetX: number, offsetY: number): void {
    patternCells.forEach(([x, y]) => this.addCell(x + offsetX, y + offsetY));
  }

  randomizeAround(centerX: number, centerY: number, areaSize = 100, fillPercentage?: number): void {
    const fill = fillPercentage ?? Math.floor(Math.random() * 100);
    const half = Math.floor(areaSize / 2);
    this.liveCells.clear();

    for (let x = centerX - half; x < centerX + half; x++) {
      for (let y = centerY - half; y < centerY + half; y++) {
        if (Math.random() * 100 < fill) this.addCell(x, y);
      }
    }
  }

  step(): void {
    const neighborCounts = new Map<CellKey, number>();

    for (const cellKey of this.liveCells) {
      const [x, y] = this.parseKey(cellKey);
      for (const [dx, dy] of NEIGHBORS) {
        const nKey = this.key(x + dx, y + dy);
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

    this.liveCells = nextLiveCells;
  }
}
