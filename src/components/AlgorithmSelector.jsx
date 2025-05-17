import React from 'react';

const AlgorithmSelector = ({ algorithm, onChange, disabled }) => {
  const algorithms = [
    'Naive',
    'MRV',
    'Degree',
    'Combined',
    'ForwardChecking',
    'MAC',
    'RandomRestart',
    'DancingLinks'
  ];
  
  return (
    <div className="algorithm-selector">
      <label htmlFor="algorithm" className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
        Algorithm:
      </label>
      <select 
        id="algorithm" 
        value={algorithm} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        {algorithms.map(algo => (
          <option key={algo} value={algo}>{algo}</option>
        ))}
      </select>
    </div>
  );
};

export default AlgorithmSelector;
