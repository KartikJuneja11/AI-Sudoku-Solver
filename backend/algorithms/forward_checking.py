import time

def solve(board):
    """Forward Checking solver for Sudoku."""
    board_copy = [row[:] for row in board]
    start_time = time.time()
    
    # Initialize domains for all cells
    domains = {}
    for i in range(9):
        for j in range(9):
            if board_copy[i][j] == 0:
                domains[(i, j)] = set(range(1, 10))
            else:
                domains[(i, j)] = {board_copy[i][j]}
    
    def get_related_cells(r, c):
        """Get all cells in the same row, column, and box."""
        related = set()
        # Add cells in the same row
        for j in range(9):
            if j != c:
                related.add((r, j))
        # Add cells in the same column
        for i in range(9):
            if i != r:
                related.add((i, c))
        # Add cells in the same 3x3 box
        box_row, box_col = 3 * (r // 3), 3 * (c // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if i != r or j != c:
                    related.add((i, j))
        return related
    
    def update_domains(doms, r, c, val):
        """Remove value from domains of related cells. Return False if domain wipeout occurs."""
        for cell in get_related_cells(r, c):
            if cell in doms and val in doms[cell]:
                doms[cell].remove(val)
                if len(doms[cell]) == 0:
                    return False  # Domain wipeout
        return True
    
    # Initial domain update based on filled cells
    for i in range(9):
        for j in range(9):
            if board_copy[i][j] != 0:
                if not update_domains(domains, i, j, board_copy[i][j]):
                    return board_copy, {"algorithm": "ForwardChecking", "time": 0, "nodes": 0, "assignments": 0, "backtracks": 0, "prunes": 0}, False
    
    def select_cell(doms):
        """Select empty cell with minimum remaining values (MRV heuristic)."""
        min_remaining = 10
        mrv_cell = None
        for i in range(9):
            for j in range(9):
                if board_copy[i][j] == 0:
                    cell = (i, j)
                    domain_size = len(doms[cell])
                    if domain_size > 0 and domain_size < min_remaining:
                        min_remaining = domain_size
                        mrv_cell = cell
        return mrv_cell
    
    def backtrack(doms):
        """Recursive backtracking with forward checking."""
        # Check if board is complete
        cell = select_cell(doms)
        if not cell:
            # Verify if board is actually solved
            for i in range(9):
                for j in range(9):
                    if board_copy[i][j] == 0:
                        return False
            return True
        
        row, col = cell
        domain_copy = list(doms[cell])  # Copy current domain to try values
        
        for num in domain_copy:
            domains_backup = {k: v.copy() for k, v in doms.items()}  # Backup domains for backtracking
            board_copy[row][col] = num
            doms[cell] = {num}
            
            if update_domains(doms, row, col, num):
                if backtrack(doms):
                    return True
            
            # Backtrack if solution not found
            board_copy[row][col] = 0
            doms.update(domains_backup)
        
        return False
    
    result = backtrack(domains)
    time_taken = time.time() - start_time
    
    # Return in the format expected by solver.py
    return board_copy, {
        "algorithm": "ForwardChecking",
        "time": time_taken,
        "nodes": 0,
        "assignments": 0,
        "backtracks": 0,
        "prunes": 0
    }, result
