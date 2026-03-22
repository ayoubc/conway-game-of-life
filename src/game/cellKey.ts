import type { Cell, CellKey } from './types';

export function toCellKey(x: number, y: number): CellKey {
  return `${x},${y}`;
}

export function fromCellKey(cellKey: CellKey): Cell {
  const [x, y] = cellKey.split(',').map(Number);
  return [x, y];
}
