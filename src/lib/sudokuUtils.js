/**
 * Get all cells that are related to the given cell (same row, column, or box)
 */
export function getRelatedCells(row, col) {
  const relatedCells = [];
  
  // Same row
  for (let c = 0; c < 9; c++) {
    if (c !== col) {
      relatedCells.push([row, c]);
    }
  }
  
  // Same column
  for (let r = 0; r < 9; r++) {
    if (r !== row) {
      relatedCells.push([r, col]);
    }
  }
  
  // Same box
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if (r !== row || c !== col) {
        relatedCells.push([r, c]);
      }
    }
  }
  
  return relatedCells;
}

/**
 * Check if a value placement is valid in the context of the board
 */
export function validateSudoku(board, row, col) {
  const value = board[row][col].value;
  
  if (value === null) return true;
  
  // Check row
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i].value === value) {
      return false;
    }
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i][col].value === value) {
      return false;
    }
  }
  
  // Check 3x3 box
  const boxStartRow = row - (row % 3);
  const boxStartCol = col - (col % 3);
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = boxStartRow + i;
      const c = boxStartCol + j;
      if ((r !== row || c !== col) && board[r][c].value === value) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Check if the entire board is valid
 */
export function isBoardValid(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value !== null && !validateSudoku(board, row, col)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check if the board is completely filled
 */
export function isBoardComplete(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === null) {
        return false;
      }
    }
  }
  return true;
}