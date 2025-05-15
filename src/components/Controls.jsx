import React from 'react';

const Controls = ({ 
  difficulty, 
  onNewGame, 
  onReset, 
  onToggleNotes, 
  notesMode
}) => {
  const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Expert'];

  // Create a separate function for new game to explicitly handle the difficulty
  const handleNewGame = () => {
    onNewGame(difficulty);
  };

  return (
    <div className="controls my-4 flex flex-wrap gap-2 justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleNewGame}
      >
        New Game
      </button>
      
      <button
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        onClick={onReset}
      >
        Reset
      </button>
      
      <select
        className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        value={difficulty}
        onChange={(e) => onNewGame(e.target.value)}
      >
        {difficultyOptions.map(level => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      
      <button
        className={`px-4 py-2 rounded ${
          notesMode 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
        }`}
        onClick={onToggleNotes}
      >
        Notes Mode
      </button>
    </div>
  );
};

export default Controls;