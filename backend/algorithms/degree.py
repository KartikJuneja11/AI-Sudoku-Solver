import time
from ..metrics import Metrics

def solve(board):
    """Degree heuristic solver - selects cells with most constraints."""
    board_copy = [row[:] for row in board]
    metrics = Metrics("Degree")
    start_time = time.time()
    
    def count_constraints(r, c):
        """Count the number of empty cells in same row, column, and box."""
        count = 0
        
        # Count empty cells in the same row
        for j in range(9):
            if j != c and board_copy[r][j] == 0:
                count += 1
        
        # Count empty cells in the same column
        for i in range(9):
            if i != r and board_copy[i][c] == 0:
                count += 1
        
        # Count empty cells in the same 3x3 box
        box_row, box_col = 3 * (r // 3), 3 * (c // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if (i != r or j != c) and board_copy[i][j] == 0:
                    count += 1
        
        metrics.count_check()
        return count
    
    def is_valid(r, c, num):
        # Check row
        for j in range(9):
            if board_copy[r][j] == num:
                return False
        
        # Check column
        for i in range(9):
            if board_copy[i][c] == num:
                return False
        
        # Check 3x3 box
        box_row, box_col = 3 * (r // 3), 3 * (c // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if board_copy[i][j] == num:
                    return False
        
        metrics.count_check()
        return True
    
    def find_degree_cell():
        """Find the empty cell with the most constraints (degree)."""
        max_degree = -1
        degree_cell = None
        
        for i in range(9):
            for j in range(9):
                if board_copy[i][j] == 0:
                    degree = count_constraints(i, j)
                    if degree > max_degree:
                        max_degree = degree
                        degree_cell = (i, j)
        
        return degree_cell
    
    def backtrack():
        metrics.count_node()
        # Find cell with highest degree
        cell = find_degree_cell()
        
        # If no empty cell found, we've solved the puzzle
        if not cell:
            return True
        
        row, col = cell
        
        # Try each number
        for num in range(1, 10):
            if is_valid(row, col, num):
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
