import time
import random
from ..metrics import Metrics

def solve(board):
    """Random restart backtracking solver."""
    metrics = Metrics("RandomRestart")
    start_time = time.time()
    
    # Parameters for random restart
    max_attempts = 5
    max_backtracks_per_attempt = 100
    
    # Clone board each time to avoid modifying original
    board_copy = [row[:] for row in board]
    
    def backtrack(restarts, max_backtracks):
        current_backtracks = 0
        metrics.count_node()
        
        # Find an empty cell
        empty_cell = find_empty(board_copy)
        if not empty_cell:
            return True  # Puzzle solved
        
        row, col = empty_cell
        
        # Use a shuffled order of values
        values = list(range(1, 10))
        random.shuffle(values)
        
        # Try each number in random order
        for num in values:
            metrics.count_check()
            if is_valid(board_copy, row, col, num):
                # Place number and recurse
                board_copy[row][col] = num
                metrics.count_assignment()
                
                if backtrack(restarts, max_backtracks):
                    return True
                
                # If recursive call fails, backtrack
                board_copy[row][col] = 0
                metrics.count_backtrack()
                current_backtracks += 1
                
                # If we've hit the backtrack limit, signal restart
                if current_backtracks >= max_backtracks:
                    return False
        
        return False
    
    # Try solving with random restarts
    solved = False
    attempts = 0
    
    while attempts < max_attempts and not solved:
        attempts += 1
        # Reset board to original state
        board_copy = [row[:] for row in board]
        
        # Try to solve
        solved = backtrack(attempts, max_backtracks_per_attempt)
    
    metrics.add_extra("restarts", attempts - 1)
    metrics.set_time(time.time() - start_time)
    
    return board_copy, metrics.to_dict(), solved

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
