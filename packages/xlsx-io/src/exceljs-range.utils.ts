export const colLetterToNumber = (col: string): number =>
  col.split('').reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);

export const parseRangeRef = (
  ref: string,
): { startRow: number; startCol: number; endRow: number; endCol: number } | null => {
  const match = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i.exec(ref.trim());
  if (!match) return null;
  const startCol = colLetterToNumber(match[1]!.toUpperCase()) - 1;
  const startRow = Number(match[2]) - 1;
  const endCol = match[3] ? colLetterToNumber(match[3].toUpperCase()) - 1 : startCol;
  const endRow = match[4] ? Number(match[4]) - 1 : startRow;
  return { startRow, startCol, endRow, endCol };
};
