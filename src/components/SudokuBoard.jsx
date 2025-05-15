import React from 'react';
import SudokuCell from './SudokuCell';

const SudokuBoard = ({ 
  board, 
  selectedCell, 
  relatedCells, 
  onCellClick 
}) => {
  if (!board || board.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading Sudoku board...</p>
      </div>
    );
  }

  const isRelatedCell = (row, col) => {
    return relatedCells.some(([r, c]) => r === row && c === col);
  };

  const isSelectedCell = (row, col) => {
    return selectedCell !== null && selectedCell[0] === row && selectedCell[1] === col;
  };

  return (
    <div className="sudoku-board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <SudokuCell
            key={`${rowIndex}-${colIndex}`}
            value={cell.value}
            notes={cell.notes}
            isInitial={cell.isInitial}
            isSelected={isSelectedCell(rowIndex, colIndex)}
            isRelated={isRelatedCell(rowIndex, colIndex)}
            isValid={cell.isValid}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default SudokuBoard;