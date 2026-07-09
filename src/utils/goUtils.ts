/**
 * Convert Go coordinates string to array indices
 * @param coordsStr - Position coordinate string like "A1"
 * @param boardSize - Board size (e.g., 19)
 * @returns [col, row] indices or null if invalid
 */
export function coordsToIndex(coordsStr: string, boardSize: number): [number, number] | null {
  // Use regex to parse input string
  const match = coordsStr.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) {
    return null;
  }

  const [, colStr, rowStr] = match;

  // Check if column letter is single character
  if (colStr.length !== 1) {
    return null;
  }

  const col = colStr.toUpperCase();
  const row = parseInt(rowStr);

  // Validate column letter (skip 'I')
  if (col === 'I') {
    return null;
  } else if (col < 'A' || (col > 'H' && col < 'J') || col > 'T') {
    return null;
  }

  // Calculate column number (skip 'I')
  let colNum: number;
  if (col <= 'H') {
    colNum = col.charCodeAt(0) - 'A'.charCodeAt(0); // A=0, B=1, ..., H=7
  } else {
    colNum = col.charCodeAt(0) - 'J'.charCodeAt(0) + 8; // J=8, K=9, ..., T=18
  }

  // Validate row and column are within board range
  if (row < 1 || row > boardSize) {
    return null;
  }

  // Convert to array indices (row is inverted)
  return [colNum, boardSize - row];
}

/**
 * Convert array indices to Go coordinates string
 * @param col - Column index (0-based)
 * @param row - Row index (0-based)
 * @param boardSize - Board size (e.g., 19)
 * @returns Coordinate string like "A1" or null if invalid
 */
export function indexToCoords(col: number, row: number, boardSize: number): string | null {
  // Validate indices
  if (col < 0 || col >= boardSize || row < 0 || row >= boardSize) {
    return null;
  }

  // Calculate column letter (skip 'I')
  let colLetter: string;
  if (col <= 7) {
    colLetter = String.fromCharCode('A'.charCodeAt(0) + col); // A=0, B=1, ..., H=7
  } else {
    colLetter = String.fromCharCode('J'.charCodeAt(0) + col - 8); // J=8, K=9, ..., T=18
  }

  // Calculate row number (inverted)
  const rowNum = boardSize - row;

  return `${colLetter}${rowNum}`;
}

/**
 * Validate Go position format
 * @param position - Position string like "A1"
 * @returns true if valid
 */
export function isValidPosition(position: string): boolean {
  const positionRegex = /^[A-T][1-9][0-9]?$/;
  return positionRegex.test(position);
}

/**
 * Validate Go color
 * @param color - Color string
 * @returns true if valid
 */
export function isValidColor(color: string): color is 'B' | 'W' {
  return color === 'B' || color === 'W';
}
