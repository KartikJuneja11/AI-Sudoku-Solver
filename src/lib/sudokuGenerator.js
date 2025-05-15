// Difficulty levels and corresponding cells to remove
const DIFFICULTY_LEVELS = {
  Easy: 30,
  Medium: 45,
  Hard: 55,
  Expert: 65
};

/**
 * Generate a complete, valid Sudoku puzzle
 */
function generateCompletePuzzle() {
  const board = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill the diagonal boxes first (these are independent of each other)
  fillDiagonalBoxes(board);
  
  // Fill the rest of the board
  solveSudoku(board);
  
  return board;
}

/**
 * Fill the three diagonal 3x3 boxes
 */
function fillDiagonalBoxes(board) {
  for (let box = 0; box < 9; box += 3) {
    fillBox(board, box, box);
  }
}

/**
 * Fill a 3x3 box with random valid numbers
 */
function fillBox(board, startRow, startCol) {
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  
  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[startRow + i][startCol + j] = numbers[index++];
    }
  }
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if it's safe to place a number at a specific position
 */
function isSafe(board, row, col, num) {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxStartRow = row - (row % 3);
  const boxStartCol = col - (col % 3);
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxStartRow + i][boxStartCol + j] === num) return false;
    }
  }
  
  return true;
}

/**
 * Solve the Sudoku puzzle using backtracking
 */
function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Find an empty cell
      if (board[row][col] === 0) {
        // Try each number
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            
            // Recursively solve the rest of the puzzle
            if (solveSudoku(board)) {
              return true;
            }
            
            // If we can't solve with this number, backtrack
            board[row][col] = 0;
          }
        }
        // No solution found
        return false;
      }
    }
  }
  // All cells filled
  return true;
}

/**
 * Create the final puzzle by removing numbers from the solution
 */
function createPuzzle(solution, difficulty) {
  const puzzle = solution.map(row => [...row]);
  const cellsToRemove = DIFFICULTY_LEVELS[difficulty];
  
  const positions = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }
  
  const shuffledPositions = shuffle(positions);
  
  for (let i = 0; i < cellsToRemove; i++) {
    const [row, col] = shuffledPositions[i];
    puzzle[row][col] = 0;
  }
  
  return puzzle;
}

/**
 * Generate a Sudoku puzzle with a given difficulty
 */
export function generateSudoku(difficulty) {
  const solution = generateCompletePuzzle();
  const puzzle = createPuzzle(solution, difficulty);
  
  return {
    puzzle,
    solution
  };
}