export type Cell = [number, number];

export type CellKey = `${number},${number}`;

export interface PatternDefinition {
  name: string;
  cells: Cell[] | ((length: number) => Cell[]);
}

export function isPatternGenerator(cells: PatternDefinition['cells']): cells is (length: number) => Cell[] {
  return typeof cells === 'function';
}

export type PatternMap = Record<string, PatternDefinition>;

export interface CameraState {
  x: number;
  y: number;
  cellSize: number;
}

export interface VisibleBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
