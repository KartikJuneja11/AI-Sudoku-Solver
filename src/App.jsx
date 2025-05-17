// src/App.jsx
import { useState, useEffect } from 'react';
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
  const [showSolverUI, setShowSolverUI] = useState(false);
  const [solverOutput, setSolverOutput] = useState('');
  const [isSolving, setIsSolving] = useState(false); // For loading state during API call


  useEffect(() => {
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
    const { puzzle } = generateSudoku(diff); // Solution from generator not strictly needed if backend solves

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
    setInitialBoard(JSON.parse(JSON.stringify(newBoard))); // Deep copy
    setSelectedCell(null);
    setRelatedCells([]);
    setDifficulty(diff);
    setSolverOutput('');
    setIsSolving(false);
  };

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(initialBoard))); // Deep copy
    setSelectedCell(null);
    setRelatedCells([]);
    setSolverOutput('');
    setIsSolving(false);
  };

  const selectCell = (row, col) => {
    setSelectedCell([row, col]);
    setRelatedCells(getRelatedCells(row, col));
  };

  const updateCell = (value) => {
    if (!selectedCell || isSolving) return;

    const [row, col] = selectedCell;
    if (board[row][col].isInitial) return;

    const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy

    if (notesMode && value !== null) {
      const noteIndex = newBoard[row][col].notes.indexOf(value);
      if (noteIndex === -1) {
        newBoard[row][col].notes.push(value);
        newBoard[row][col].notes.sort((a, b) => a - b); // Keep notes sorted
      } else {
        newBoard[row][col].notes.splice(noteIndex, 1);
      }
      newBoard[row][col].value = null;
    } else {
      newBoard[row][col].value = value;
      newBoard[row][col].notes = [];
      const isValidMove = validateSudoku(newBoard, row, col); // Validate individual move
      newBoard[row][col].isValid = isValidMove;
    }
    setBoard(newBoard);

    if (!notesMode && value !== null && isBoardComplete(newBoard) && isBoardValid(newBoard)) {
      alert('Congratulations! You solved the puzzle!');
    }
  };

  const clearSelectedCell = () => {
    if (!selectedCell || isSolving || !board[selectedCell[0]] || !board[selectedCell[0]][selectedCell[1]]) return;

    const [row, col] = selectedCell;
    if (board[row][col].isInitial) return;

    const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy
    newBoard[row][col].value = null;
    newBoard[row][col].notes = [];
    newBoard[row][col].isValid = true; // Clearing makes it valid or unchecked

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
    setSolverOutput('');
    setIsSolving(false);
    return true;
  };
  const toggleSolverUI = () => {
    setShowSolverUI(!showSolverUI);
  };

  const solveSudokuWithAPI = async () => {
    setIsSolving(true);
    setSolverOutput('Solving with backend...');

    // Convert board to simple 2D array of numbers (0 for null/empty)
    const boardForAPI = board.map(row =>
      row.map(cell => cell.value || 0)
    );

    try {
      const response = await fetch('http://localhost:5001/solve-sudoku', { // Ensure port matches Flask app
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board: boardForAPI }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle HTTP errors (e.g., 400, 422, 500)
        setSolverOutput(`Error: ${result.error || `Server responded with ${response.status}`}`);
        setIsSolving(false);
        return;
      }
      
      if (result.solution) {
        const solvedBoardFromAPI = result.solution;
        const newBoard = JSON.parse(JSON.stringify(board)); // Start with current board structure

        solvedBoardFromAPI.forEach((rowValues, rowIndex) => {
          rowValues.forEach((value, colIndex) => {
            // Only update non-initial cells
            if (!newBoard[rowIndex][colIndex].isInitial && value !== 0) {
              newBoard[rowIndex][colIndex].value = value;
              newBoard[rowIndex][colIndex].notes = []; // Clear notes
              newBoard[rowIndex][colIndex].isValid = true; // Solved cells are valid
            }
          });
        });
        setBoard(newBoard);
        setSolverOutput("Sudoku solved successfully by the backend!");
      } else if (result.error) {
         setSolverOutput(`Solver Error: ${result.error}`);
      } else {
         setSolverOutput("Unknown response from solver.");
      }

    } catch (error) {
      console.error("API call failed:", error);
      setSolverOutput(`Network Error: Could not connect to the solver. (${error.message})`);
    } finally {
      setIsSolving(false);
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
          <div className={`${showSolverUI ? 'md:w-1/2' : 'w-full'}`}> {/* Adjust width based on solver UI */}
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

          {showSolverUI && (
            <div className="md:w-1/2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-full shadow">
                <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Backend Solver</h2>
                {solverOutput ? (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96 text-sm whitespace-pre-wrap">
                    {solverOutput}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Click the button to solve the current Sudoku using the Python backend.
                    </p>
                  </div>
                )}
                 <button
                      className={`w-full mt-4 bg-green-500 text-white px-4 py-2 rounded ${isSolving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                      onClick={solveSudokuWithAPI}
                      disabled={isSolving}
                    >
                      {isSolving ? 'Solving...' : 'Solve with Backend API'}
                    </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center"
            onClick={toggleSolverUI}
          >
            {showSolverUI ? 'Hide Solver' : 'Show Solver'}
          </button>
        </div>

        <footer className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with React and Tailwind CSS. Solver powered by Python/Flask.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;