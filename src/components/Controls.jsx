import React from 'react';
import AlgorithmSelector from './AlgorithmSelector';

const Controls = ({ 
  difficulty, 
  onNewGame, 
  onReset,
  onSaveGame,
  onLoadGame,
  onToggleNotes, 
  notesMode,
  algorithm,
  onAlgorithmChange,
  onSolve,
  onCompare,
  onVisualize,
  isSolving
}) => {
  const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Expert'];
  
  const handleNewGame = () => {
    onNewGame(difficulty);
  };
  
  return (
    <div className="controls bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="game-controls flex flex-wrap gap-2 mb-4">
        <button 
          onClick={handleNewGame} 
          disabled={isSolving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          New Game
        </button>
        <button 
          onClick={onReset} 
          disabled={isSolving}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button 
          onClick={onSaveGame} 
          disabled={isSolving}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          Save Game
        </button>
        <button 
          onClick={onLoadGame} 
          disabled={isSolving}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          Load Game
        </button>
        <button 
          onClick={onToggleNotes} 
          className={`${
            notesMode 
              ? 'bg-purple-600 text-white' 
              : 'bg-white text-purple-600 border border-purple-600'
          } hover:bg-purple-700 hover:text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isSolving}
        >
          Notes Mode
        </button>
      </div>
      
      <div className="difficulty-controls flex items-center gap-2 mb-4">
        <label htmlFor="difficulty" className="text-gray-700 dark:text-white font-medium">
          Difficulty:
        </label>
        <select 
          id="difficulty" 
          value={difficulty} 
          onChange={(e) => onNewGame(e.target.value)}
          disabled={isSolving}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {difficultyOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      <div className="solver-controls flex flex-wrap gap-2">
        <div className="algorithm-select-wrapper flex-grow max-w-xs">
          <AlgorithmSelector
            algorithm={algorithm}
            onChange={onAlgorithmChange}
            disabled={isSolving}
          />
        </div>
        <button 
          onClick={onSolve} 
          disabled={isSolving}
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
        >
          {isSolving ? 'Solving...' : 'Solve'}
        </button>
        <button 
          onClick={onCompare} 
          disabled={isSolving}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-yellow-400 disabled:cursor-not-allowed"
        >
          Compare Algorithms
        </button>
        <button 
          onClick={onVisualize} 
          disabled={isSolving}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed"
        >
          Visualize Results
        </button>
      </div>
    </div>
  );
};

export default Controls;
