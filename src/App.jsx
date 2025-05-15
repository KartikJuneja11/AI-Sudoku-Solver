import { useState, useEffect } from 'react';
import { usePython } from 'react-py';
import SudokuBoard from './components/SudokuBoard';
import Controls from './components/Controls';
import NumberPad from './components/NumberPad';
import { generateSudoku } from './lib/sudokuGenerator';
import { validateSudoku, isBoardValid, isBoardComplete, getRelatedCells } from './lib/sudokuUtils';
import { saveSudokuGame, loadSudokuGame, hasSavedGame } from './lib/sudokuStorage';
import { ThemeToggle } from "./components/toggleTheme";

const App = () => {
  const [board, setBoard] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [relatedCells, setRelatedCells] = useState([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [notesMode, setNotesMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPythonSolver, setShowPythonSolver] = useState(false);
  const [pythonSolverOutput, setPythonSolverOutput] = useState('');
  
  // Python integration
  const { runPython, stdout, stderr, isLoading } = usePython();

  // Initialize game on first load
  useEffect(() => {
    // Check if there's a saved game
    if (hasSavedGame()) {
      const success = loadGame();
      if (!success) {
        startNewGame();
      }
    } else {
      startNewGame();
    }
  }, []);

  const startNewGame = (newDifficulty = difficulty) => {
    const diff = newDifficulty || 'Easy';
    const { puzzle, solution } = generateSudoku(diff);
    
    // Convert puzzle to board format
    const newBoard = Array(9).fill(null).map((_, row) => 
      Array(9).fill(null).map((_, col) => {
        const value = puzzle[row][col];
        return {
          value: value === 0 ? null : value,
          isInitial: value !== 0,
          notes: [],
          isValid: true
        };
      })
    );
    
    setBoard(newBoard);
    setInitialBoard(JSON.parse(JSON.stringify(newBoard)));
    setSelectedCell(null);
    setRelatedCells([]);
    setDifficulty(diff);
    setPythonSolverOutput('');
  };

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(initialBoard)));
    setSelectedCell(null);
    setRelatedCells([]);
    setPythonSolverOutput('');
  };

  const selectCell = (row, col) => {
    setSelectedCell([row, col]);
    setRelatedCells(getRelatedCells(row, col));
  };

  const updateCell = (value) => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    if (board[row][col].isInitial) return;
    
    const newBoard = JSON.parse(JSON.stringify(board));
    
    if (notesMode && value !== null) {
      // Handle notes mode
      const noteIndex = newBoard[row][col].notes.indexOf(value);
      if (noteIndex === -1) {
        newBoard[row][col].notes.push(value);
      } else {
        newBoard[row][col].notes.splice(noteIndex, 1);
      }
      newBoard[row][col].value = null;
    } else {
      // Normal value entry
      newBoard[row][col].value = value;
      newBoard[row][col].notes = [];
      // Check if the move is valid
      const isValid = validateSudoku(newBoard, row, col);
      newBoard[row][col].isValid = isValid;
    }
    
    setBoard(newBoard);
    
    // Check if game is complete
    if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
      alert('Congratulations! You solved the puzzle!');
    }
  };

  const clearSelectedCell = () => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    if (board[row][col].isInitial) return;
    
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[row][col].value = null;
    newBoard[row][col].notes = [];
    newBoard[row][col].isValid = true;
    
    setBoard(newBoard);
  };

  const toggleNotesMode = () => {
    setNotesMode(!notesMode);
  };

  const saveGame = () => {
    saveSudokuGame({
      board,
      initialBoard,
      difficulty
    });
    alert('Game saved successfully!');
  };

  const loadGame = () => {
    const savedGame = loadSudokuGame();
    if (!savedGame) {
      alert('No saved game found!');
      return false;
    }
    
    setBoard(savedGame.board);
    setInitialBoard(savedGame.initialBoard);
    setDifficulty(savedGame.difficulty);
    setSelectedCell(null);
    setRelatedCells([]);
    setPythonSolverOutput('');
    
    return true;
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const togglePythonSolver = () => {
    setShowPythonSolver(!showPythonSolver);
  };

  const solveSudokuWithPython = async () => {
    if (isLoading) {
      setPythonSolverOutput("Python environment is still loading...");
      return;
    }
    
    try {
      const boardPython = JSON.stringify(board.map(row => 
        row.map(cell => cell.value || 0)
      ));
      
      const pythonCode = `
import json

def solve_sudoku(board):
    # Find an empty cell
    empty_cell = find_empty_cell(board)
    if not empty_cell:
        return True  # Puzzle solved
    
    row, col = empty_cell
    
    # Try each number
    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num
            
            # Recursively try to solve the rest
            if solve_sudoku(board):
                return True
            
            # If we get here, this number didn't work
            board[row][col] = 0
    
    return False

def find_empty_cell(board):
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0:
                return (i, j)
    return None

def is_valid(board, row, col, num):
    # Check row
    for j in range(9):
        if board[row][j] == num:
            return False
    
    # Check column
    for i in range(9):
        if board[i][col] == num:
            return False
    
    # Check 3x3 box
    box_row, box_col = 3 * (row // 3), 3 * (col // 3)
    for i in range(box_row, box_row + 3):
        for j in range(box_col, box_col + 3):
            if board[i][j] == num:
                return False
    
    return True

board = json.loads('${boardPython}')
solve_sudoku(board)
print(json.dumps(board))
      `;
      
      await runPython(pythonCode);
      
      if (stderr) {
        setPythonSolverOutput(`Error: ${stderr}`);
        return;
      }
      
      const solution = JSON.parse(stdout.trim());
      
      // Update the board with the solution
      const newBoard = JSON.parse(JSON.stringify(board));
      solution.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          if (!board[rowIndex][colIndex].isInitial && value !== 0) {
            newBoard[rowIndex][colIndex].value = value;
            newBoard[rowIndex][colIndex].isValid = true;
          }
        });
      });
      
      setBoard(newBoard);
      setPythonSolverOutput("Sudoku solved successfully with Python!");
    } catch (error) {
      setPythonSolverOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sudoku</h1>
          <div className="flex space-x-4 items-center">
            <div className="flex space-x-2">
              <button onClick={saveGame} className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Save Game
              </button>
              <button onClick={loadGame} className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Load Game
              </button>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        <Controls
          difficulty={difficulty}
          onNewGame={startNewGame}
          onReset={resetGame}
          onToggleNotes={toggleNotesMode}
          notesMode={notesMode}
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className={`${showPythonSolver ? 'md:w-1/2' : 'w-full'}`}>
            <SudokuBoard
              board={board}
              selectedCell={selectedCell}
              relatedCells={relatedCells}
              onCellClick={selectCell}
            />
            
            <NumberPad
              onNumberClick={updateCell}
              onClear={clearSelectedCell}
            />
          </div>
          
          {showPythonSolver && (
            <div className="md:w-1/2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-full shadow">
                <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Python Solver</h2>
                {pythonSolverOutput ? (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96 text-sm">
                    {pythonSolverOutput}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Click the button below to solve the current Sudoku puzzle using Python</p>
                    <button 
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      onClick={solveSudokuWithPython}
                    >
                      Solve with Python
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center"
            onClick={togglePythonSolver}
          >
            {showPythonSolver ? 'Hide Python Solver' : 'Show Python Solver'}
          </button>
        </div>
        
        <footer className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with React and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
