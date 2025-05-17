import time
from ..metrics import Metrics

def solve(board):
    """Minimum Remaining Values heuristic solver."""
    board_copy = [row[:] for row in board]
    metrics = Metrics("MRV")
    start_time = time.time()
    
    def get_domain(r, c):
        """Get possible values for cell (r,c)."""
        if board_copy[r][c] != 0:
            return []
        
        domain = set(range(1, 10))
        
        # Remove values that appear in the same row
        for j in range(9):
            if board_copy[r][j] in domain:
                domain.remove(board_copy[r][j])
        
        # Remove values that appear in the same column
        for i in range(9):
            if board_copy[i][c] in domain:
                domain.remove(board_copy[i][c])
        
        # Remove values that appear in the same 3x3 box
        box_row, box_col = 3 * (r // 3), 3 * (c // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if board_copy[i][j] in domain:
                    domain.remove(board_copy[i][j])
        
        metrics.count_check()
        return list(domain)
    
    def find_mrv_cell():
        """Find the empty cell with the fewest legal values (MRV)."""
        min_remaining = 10  # More than possible values
        mrv_cell = None
        
        for i in range(9):
            for j in range(9):
                if board_copy[i][j] == 0:
                    domain = get_domain(i, j)
                    if len(domain) < min_remaining:
                        min_remaining = len(domain)
                        mrv_cell = (i, j, domain)
                        if min_remaining == 0:
                            return mrv_cell  # No valid values, fail quickly
        
        return mrv_cell
    
    def backtrack():
        metrics.count_node()
        # Find cell with minimum remaining values
        mrv_result = find_mrv_cell()
        
        # If no empty cell found, we've solved the puzzle
        if not mrv_result:
            return True
        
        row, col, domain = mrv_result
        
        # If domain is empty, this branch is invalid
        if not domain:
            return False
        
        # Try each value in the domain
        for num in domain:
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
