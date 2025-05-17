import React from 'react';

const AlgorithmDescription = ({ algorithm }) => {
  const descriptions = {
    'Naive': 'Basic backtracking solver that tries all possible values for each empty cell in order, recursively.',
    
    'MRV': 'Minimum Remaining Values heuristic selects cells with the fewest legal values first, reducing branching factor.',
    
    'Degree': 'Degree heuristic selects cells with the most constraints on other variables (cells), affecting the most unassigned variables.',
    
    'Combined': 'Uses MRV as primary heuristic and breaks ties using the Degree heuristic for optimal variable ordering.',
    
    'ForwardChecking': 'Maintains domains of unassigned variables and immediately detects when a variable has no legal values left.',
    
    'MAC': 'Maintaining Arc Consistency propagates constraints after each assignment to prune domains of unassigned variables.',
    
    'RandomRestart': 'Adds randomization to value selection and restarts after hitting backtrack limits to escape local dead-ends.',
    
    'DancingLinks': 'Uses Knuth\'s Algorithm X with Dancing Links to solve Sudoku as an exact cover problem efficiently.'
  };
  
  return (
    <div className="algorithm-description">
      <h3>Algorithm: {algorithm}</h3>
      <p>{descriptions[algorithm] || 'No description available for this algorithm.'}</p>
    </div>
  );
};

export default AlgorithmDescription;
