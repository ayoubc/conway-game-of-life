import type { Cell, PatternDefinition, PatternMap } from './types';
import { isPatternGenerator } from './types';

interface JsonPatternGenerator {
  type: 'line';
  defaultLength?: number;
  origin: Cell;
  step: Cell;
}

interface JsonPatternDefinition {
  name: string;
  cells?: Cell[];
  generator?: JsonPatternGenerator;
}

function buildGenerator(generator: JsonPatternGenerator): (length: number) => Cell[] {
  switch (generator.type) {
    case 'line': {
      return (length: number) => {
        const resolvedLength = Number.isFinite(length) && length > 0
          ? Math.floor(length)
          : (generator.defaultLength ?? 10);

        return Array.from({ length: resolvedLength }, (_, i) => [
          generator.origin[0] + i * generator.step[0],
          generator.origin[1] + i * generator.step[1]
        ] as Cell);
      };
    }
  }
}

function toPatternDefinition(json: JsonPatternDefinition): PatternDefinition {
  if (json.generator) {
    return {
      name: json.name,
      cells: buildGenerator(json.generator)
    };
  }

  return {
    name: json.name,
    cells: json.cells ?? []
  };
}

const patternModules = import.meta.glob('./patterns-data/*.json', { eager: true, import: 'default' }) as Record<string, JsonPatternDefinition>;

export const PATTERNS: PatternMap = Object.fromEntries(
  Object.entries(patternModules).map(([path, json]) => {
    const key = path.split('/').at(-1)?.replace('.json', '') ?? path;
    return [key, toPatternDefinition(json)];
  })
);

export const PATTERN_NAME_TO_KEY = Object.fromEntries(
  Object.entries(PATTERNS).map(([key, data]) => [data.name, key])
);

export function resolvePatternCells(pattern: PatternDefinition, length = 10): Cell[] {
  if (isPatternGenerator(pattern.cells)) {
    return pattern.cells(length);
  }

  return pattern.cells;
}
