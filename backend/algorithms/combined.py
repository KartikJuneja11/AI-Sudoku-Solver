import time
from ..metrics import Metrics

def solve(board):
    """Combined MRV + Degree heuristic solver."""
    board_copy = [row[:] for row in board]
    metrics = Metrics("Combined")
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
    
    def find_cell():
        """Find the empty cell with MRV, breaking ties with degree."""
        min_remaining = 10  # More than possible values
        candidates = []
        
        # First pass: find cells with minimum remaining values
        for i in range(9):
            for j in range(9):
                if board_copy[i][j] == 0:
                    domain = get_domain(i, j)
                    domain_size = len(domain)
                    
                    if domain_size == 0:
                        return (i, j, [])  # No valid values, fail quickly
                    
                    if domain_size < min_remaining:
                        min_remaining = domain_size
                        candidates = [(i, j, domain)]
                    elif domain_size == min_remaining:
                        candidates.append((i, j, domain))
        
        if not candidates:
            return None  # No empty cells
        
        if len(candidates) == 1:
            return candidates[0]  # No tie to break
        
        # Break ties using degree heuristic
        max_degree = -1
        best_candidate = None
        
        for r, c, domain in candidates:
            degree = count_constraints(r, c)
            if degree > max_degree:
                max_degree = degree
                best_candidate = (r, c, domain)
        
        return best_candidate
    
    def backtrack():
        metrics.count_node()
        # Find cell with combined heuristic
        cell_info = find_cell()
        
        # If no empty cell found, we've solved the puzzle
        if not cell_info:
            return True
        
        row, col, domain = cell_info
        
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
