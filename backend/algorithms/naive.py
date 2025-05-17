import time
from ..metrics import Metrics

def solve(board):
    """Basic backtracking solver without heuristics."""
    # Create a copy of the board to avoid modifying the original
    board_copy = [row[:] for row in board]
    metrics = Metrics("Naive")
    start_time = time.time()
    
    def backtrack():
        metrics.count_node()
        # Find an empty cell
        empty_cell = find_empty(board_copy)
        if not empty_cell:
            return True  # Puzzle solved
        
        row, col = empty_cell
        
        # Try each number
        for num in range(1, 10):
            metrics.count_check()
            if is_valid(board_copy, row, col, num):
                # Place number and recurse
                board_copy[row][col] = num
                metrics.count_assignment()
                
                if backtrack():
                    return True
                
                # If recursive call fails, backtrack
                board_copy[row][col] = 0
                metrics.count_backtrack()
        
        return False
    
    result = backtrack()
    metrics.set_time(time.time() - start_time)
    
    return board_copy, metrics.to_dict(), result

def find_empty(board):
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
