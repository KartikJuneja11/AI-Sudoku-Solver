import time
from collections import deque
from ..metrics import Metrics

def solve(board):
    """Maintaining Arc Consistency (MAC) solver."""
    board_copy = [row[:] for row in board]
    metrics = Metrics("MAC")
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
        """Get all cells that share a constraint with (r,c)."""
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
    
    def establish_arc_consistency(doms, start_cell):
        """AC-3 algorithm to establish arc consistency."""
        # Queue of arcs (i,j) where i and j are cells
        queue = deque()
        
        # Add arcs from start_cell to its neighbors
        if start_cell:
            for neighbor in get_related_cells(*start_cell):
                queue.append((start_cell, neighbor))
        else:
            # Initialize with all arcs for first run
            for i in range(9):
                for j in range(9):
                    cell = (i, j)
                    for neighbor in get_related_cells(i, j):
                        queue.append((cell, neighbor))
        
        while queue:
            (xi, xj) = queue.popleft()
            
            if revise(doms, xi, xj):
                if len(doms[xi]) == 0:
                    return False  # Domain wipeout
                
                # Add neighbors of xi back to queue
                for xk in get_related_cells(*xi):
                    if xk != xj:  # Avoid redundant check
                        queue.append((xk, xi))
        
        return True
    
    def revise(doms, xi, xj):
        """Revise domain of xi with respect to xj."""
        revised = False
        
        # If xj is assigned and xi contains this value, remove it
        if len(doms[xj]) == 1:
            xj_value = next(iter(doms[xj]))
            if xj_value in doms[xi]:
                doms[xi].remove(xj_value)
                metrics.count_prune()
                revised = True
        
        return revised
    
    def select_cell(doms):
        """Find the empty cell with the fewest legal values (MRV)."""
        min_remaining = 10  # More than possible values
        mrv_cell = None
        
        for cell, domain in doms.items():
            if board_copy[cell[0]][cell[1]] == 0 and 1 < len(domain) < min_remaining:
                min_remaining = len(domain)
                mrv_cell = cell
        
        return mrv_cell
    
    # Initial arc consistency
    if not establish_arc_consistency(domains, None):
        metrics.set_time(time.time() - start_time)
        return board_copy, metrics.to_dict(), False
    
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
            
            # Establish arc consistency
            if establish_arc_consistency(doms, cell):
                # Recurse
                if backtrack(doms):
                    return True
            
            # If consistency fails or recursive call fails, backtrack
            board_copy[row][col] = 0
            doms.update(domains_backup)
            metrics.count_backtrack()
        
        return False
    
    result = backtrack(domains)
    metrics.set_time(time.time() - start_time)
    
    return board_copy, metrics.to_dict(), result
