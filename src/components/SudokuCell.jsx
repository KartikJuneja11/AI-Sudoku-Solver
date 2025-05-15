import React from 'react';

const SudokuCell = ({
  value,
  notes,
  isInitial,
  isSelected,
  isRelated,
  isValid,
  onClick,
}) => {
  const cellClasses = `sudoku-cell ${isSelected ? 'cell-selected' : ''} ${
    !isSelected && isRelated ? 'cell-related' : ''
  }`;
  
  const valueClasses = `${isInitial ? 'cell-initial' : 'cell-user'} ${
    !isValid && value !== null ? 'cell-error' : ''
  }`;

  return (
    <div className={cellClasses} onClick={onClick}>
      {value ? (
        <span className={valueClasses}>{value}</span>
      ) : notes && notes.length > 0 ? (
        <div className="cell-notes">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
            <div key={num} className="cell-note">
              {notes.includes(num) && num}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SudokuCell;