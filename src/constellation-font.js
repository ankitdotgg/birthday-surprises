/**
 * Simple dot-matrix letter definitions for constellation spelling.
 * Each letter is a 5-tall x variable-wide grid of points.
 * 1 = star present, 0 = empty.
 */

const LETTER_MAP = {
  A: [
    [0,1,1,0],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  B: [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
  ],
  C: [
    [0,1,1,1],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [0,1,1,1],
  ],
  D: [
    [1,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,0],
  ],
  E: [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  F: [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,0,0,0],
  ],
  G: [
    [0,1,1,1],
    [1,0,0,0],
    [1,0,1,1],
    [1,0,0,1],
    [0,1,1,1],
  ],
  H: [
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  I: [
    [1,1,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [1,1,1],
  ],
  J: [
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [1,0,1],
    [0,1,0],
  ],
  K: [
    [1,0,0,1],
    [1,0,1,0],
    [1,1,0,0],
    [1,0,1,0],
    [1,0,0,1],
  ],
  L: [
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  M: [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  N: [
    [1,0,0,1],
    [1,1,0,1],
    [1,0,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  O: [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  P: [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,0,0],
    [1,0,0,0],
  ],
  Q: [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,1,0],
    [0,1,0,1],
  ],
  R: [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,1,0],
    [1,0,0,1],
  ],
  S: [
    [0,1,1,1],
    [1,0,0,0],
    [0,1,1,0],
    [0,0,0,1],
    [1,1,1,0],
  ],
  T: [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  U: [
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  V: [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,1,0,1,0],
    [0,0,1,0,0],
  ],
  W: [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [1,0,0,0,1],
  ],
  X: [
    [1,0,0,1],
    [0,1,1,0],
    [0,1,1,0],
    [0,1,1,0],
    [1,0,0,1],
  ],
  Y: [
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  Z: [
    [1,1,1,1],
    [0,0,1,0],
    [0,1,0,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  " ": [
    [0,0],
    [0,0],
    [0,0],
    [0,0],
    [0,0],
  ],
};

/**
 * Convert a name string into an array of {x, y} points for constellation stars.
 * Points are normalized to roughly -1..1 range centered at origin.
 */
export function nameToConstellationPoints(name) {
  const upperName = name.toUpperCase();
  const points = [];
  const GAP = 1;

  let cursorX = 0;

  for (const char of upperName) {
    const grid = LETTER_MAP[char];
    if (!grid) {
      cursorX += 3;
      continue;
    }

    const letterWidth = grid[0].length;

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < letterWidth; col++) {
        if (grid[row][col] === 1) {
          points.push({
            x: cursorX + col,
            y: (grid.length - 1) - row,
          });
        }
      }
    }

    cursorX += letterWidth + GAP;
  }

  if (points.length === 0) return [];

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const scale = Math.max(maxX - minX, maxY - minY) || 1;

  return points.map(p => ({
    x: (p.x - centerX) / scale,
    y: (p.y - centerY) / scale,
  }));
}
