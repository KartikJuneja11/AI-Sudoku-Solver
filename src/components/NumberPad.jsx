import React from 'react';

const NumberPad = ({ onNumberClick, onClear }) => {
  return (
    <div className="number-pad my-4">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded"
            onClick={() => onNumberClick(number)}
          >
            {number}
          </button>
        ))}
      </div>
      <button
        className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
};

export default NumberPad;