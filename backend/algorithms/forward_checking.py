import time
from ..metrics import Metrics

def solve(board):
    """Forward Checking solver."""
    board_copy = [row[:] for row in board]
    metrics = Metrics("ForwardChecking")
    start_time = time.time()
    
    # Initialize domains for all cells
    domains = {}
    for i in range(9):
        for j in range(9):
            if board_copy[i][j] == 0:
                domains[(i, j)] = set(range(1, 10))
            else:
                domains[(i, j)] = {board_copy[i][j]}
    
    # Initial forward check to establish domains
    for i in range(9):
        for j in range(9):
            if board_copy[i][j] != 0:
                update_domains(domains, i, j, board_copy[i][j])
    
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
        """Remove value from domains of related cells."""
        changed = False
        for cell in get_related_cells(r, c):
            if val in doms[cell] and len(doms[cell]) > 1:
                doms[cell].remove(val)
                metrics.count_prune()
                changed = True
                if len(doms[cell]) == 0:
                    return False  # Domain wipeout
        return changed
    
    def select_cell(doms):
        """Find the empty cell with the fewest legal values (MRV)."""
        min_remaining = 10  # More than possible values
        mrv_cell = None
        
        for cell, domain in doms.items():
            if board_copy[cell[0]][cell[1]] == 0 and 1 < len(domain) < min_remaining:
                min_remaining = len(domain)
                mrv_cell = cell
        
        return mrv_cell
    
    def backtrack(doms):
        metrics.count_node()
        # Find cell with minimum remaining values
        cell = select_cell(doms)
        
        # If no empty cell found, we've solved the puzzle
        if not cell:
            return True
        
        row, col = cell
        domain_copy = doms[cell].copy()
        
        # Try each value in the domain
        for num in domain_copy:
            # Save domains for backtracking
            domains_backup = {k: v.copy() for k, v in doms.items()}
            
            # Assign value
            board_copy[row][col] = num
            metrics.count_assignment()
            doms[cell] = {num}
            
            # Update domains of related cells
            if update_domains(doms, row, col, num) is False:
                # Domain wipeout, restore and try next value
                board_copy[row][col] = 0
                doms.update(domains_backup)
                metrics.count_backtrack()
                continue
            
            # Recurse
            if backtrack(doms):
                return True
            
            # If recursive call fails, backtrack
            board_copy[row][col] = 0
            doms.update(domains_backup)
            metrics.count_backtrack()
        
        return False
    
    result = backtrack(domains)
    metrics.set_time(time.time() - start_time)
    
    return board_copy, metrics.to_dict(), result

def update_domains(domains, row, col, val):
    """Helper for initial domain setup."""
    pass  # This is just a stub, the real function is in the solve method

