import { useState, useEffect } from 'react';
import SudokuBoard from './components/SudokuBoard';
import Controls from './components/Controls';
import NumberPad from './components/NumberPad';
import MetricsTable from './components/MetricsTable';
import ComparisonChart from './components/ComparisonChart';
import AlgorithmDescription from './components/AlgorithmDescription';
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
  const [algorithm, setAlgorithm] = useState('Naive');
  const [metrics, setMetrics] = useState(null);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [visualizationUrls, setVisualizationUrls] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);

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
    const { puzzle } = generateSudoku(diff);
    
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
    setMetrics(null);
    setComparisonResults([]);
    setVisualizationUrls([]);
    setShowVisualization(false);
    setIsSolving(false);
  };

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(initialBoard)));
    setSelectedCell(null);
    setRelatedCells([]);
    setMetrics(null);
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
    
    const newBoard = JSON.parse(JSON.stringify(board));
    
    if (notesMode && value !== null) {
      const noteIndex = newBoard[row][col].notes.indexOf(value);
      if (noteIndex === -1) {
        newBoard[row][col].notes.push(value);
        newBoard[row][col].notes.sort((a, b) => a - b);
      } else {
        newBoard[row][col].notes.splice(noteIndex, 1);
      }
      newBoard[row][col].value = null;
    } else {
      newBoard[row][col].value = value;
      newBoard[row][col].notes = [];
      const isValidMove = validateSudoku(newBoard, row, col);
      newBoard[row][col].isValid = isValidMove;
    }
    
    setBoard(newBoard);
    
    if (!notesMode && value !== null && isBoardComplete(newBoard) && isBoardValid(newBoard)) {
      alert('Congratulations! You solved the puzzle!');
    }
  };

  const clearSelectedCell = () => {
    if (!selectedCell || isSolving) return;
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
      difficulty, 
      algorithm 
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
    setAlgorithm(savedGame.algorithm || 'Naive');
    setSelectedCell(null);
    setRelatedCells([]);
    setMetrics(null);
    setIsSolving(false);
    
    return true;
  };

  const solveSudokuWithAPI = async () => {
    setIsSolving(true);
    setMetrics(null);
    const boardForAPI = board.map(row => row.map(cell => cell.value || 0));
    
    try {
      const response = await fetch('http://localhost:5001/solve-sudoku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: boardForAPI, algorithm, difficulty }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        alert(`Error: ${result.error || `Server responded with ${response.status}`}`);
        return;
      }
      
      if (result.solution) {
        const solvedBoardFromAPI = result.solution;
        const newBoard = JSON.parse(JSON.stringify(board));
        
        solvedBoardFromAPI.forEach((rowValues, rowIndex) => {
          rowValues.forEach((value, colIndex) => {
            if (!newBoard[rowIndex][colIndex].isInitial && value !== 0) {
              newBoard[rowIndex][colIndex].value = value;
              newBoard[rowIndex][colIndex].notes = [];
              newBoard[rowIndex][colIndex].isValid = true;
            }
          });
        });
        
        setBoard(newBoard);
        setMetrics(result.metrics);
      } else if (result.error) {
        alert(`Solver Error: ${result.error}`);
      }
    } catch (error) {
      console.error("API call failed:", error);
      alert(`Network Error: Could not connect to the solver. (${error.message})`);
    } finally {
      setIsSolving(false);
    }
  };

  const compareAlgorithms = async () => {
    setIsSolving(true);
    setComparisonResults([]);
    const boardForAPI = board.map(row => row.map(cell => cell.value || 0));
    
    try {
      const response = await fetch('http://localhost:5001/compare-algorithms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: boardForAPI, difficulty }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        alert(`Error: ${result.error || `Server responded with ${response.status}`}`);
        return;
      }
      
      if (result.results) {
        setComparisonResults(result.results);
      }
    } catch (error) {
      console.error("API call failed:", error);
      alert(`Network Error: Could not connect to the solver. (${error.message})`);
    } finally {
      setIsSolving(false);
    }
  };

  const visualizeResults = async () => {
    setIsSolving(true);
    setVisualizationUrls([]);
    setShowVisualization(false);
    
    try {
      const response = await fetch('http://localhost:5001/visualize');
      const result = await response.json();
      
      if (!response.ok) {
        alert(`Error: ${result.error || `Server responded with ${response.status}`}`);
        return;
      }
      
      if (result.plots) {
        setVisualizationUrls(result.plots.map(plot => `http://localhost:5001${plot}`));
        setShowVisualization(true);
      }
    } catch (error) {
      console.error("API call failed:", error);
      alert(`Network Error: Could not connect to the solver. (${error.message})`);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold">Sudoku Solver</h1>
        <ThemeToggle />
      </header>
      
      <main className="flex-1 p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col gap-6 w-full lg:w-1/3">
            <Controls 
              difficulty={difficulty}
              onNewGame={startNewGame}
              onReset={resetGame}
              onSaveGame={saveGame}
              onLoadGame={loadGame}
              onToggleNotes={toggleNotesMode}
              notesMode={notesMode}
              algorithm={algorithm}
              onAlgorithmChange={setAlgorithm}
              onSolve={solveSudokuWithAPI}
              onCompare={compareAlgorithms}
              onVisualize={visualizeResults}
              isSolving={isSolving}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
            />
            <AlgorithmDescription 
              algorithm={algorithm}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
            />
          </div>
          
          <div className="flex flex-col items-center gap-6 w-full lg:w-2/3">
            <SudokuBoard 
              board={board}
              selectedCell={selectedCell}
              relatedCells={relatedCells}
              onCellClick={selectCell}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
            />
            <NumberPad 
              onNumberClick={updateCell}
              onClearClick={clearSelectedCell}
              disabled={isSolving}
              className="grid grid-cols-5 gap-2"
            />
          </div>
        </div>
        
        <div className="mt-8">
          {metrics && (
            <MetricsTable 
              metrics={metrics}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
            />
          )}
          {comparisonResults.length > 0 && (
            <ComparisonChart 
              results={comparisonResults}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mt-6"
            />
          )}
          {showVisualization && visualizationUrls.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mt-6">
              <h3 className="text-lg font-semibold mb-4">Performance Visualizations</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {visualizationUrls.map((url, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <img 
                      src={url} 
                      alt={`Performance plot ${index+1}`}
                      className="max-w-full h-auto object-contain rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md">
        <p>Sudoku Solver using Various Backtracking Algorithms - Computer Engineering Project</p>
      </footer>
    </div>
  );
};

export default App;