import time
from ..metrics import Metrics

class DancingNode:
    def __init__(self, column=None, row_id=None):
        self.left = self
        self.right = self
        self.up = self
        self.down = self
        self.column = column
        self.row_id = row_id

class ColumnNode(DancingNode):
    def __init__(self, name):
        super().__init__(self)
        self.name = name
        self.size = 0

def solve(board):
    """Dancing Links (Algorithm X) solver for Sudoku."""
    metrics = Metrics("DancingLinks")
    start_time = time.time()
    
    # Copy board to avoid modifying original
    board_copy = [row[:] for row in board]
    
    # Encode the Sudoku as an exact cover problem
    matrix, row_info = encode_exact_cover(board_copy)
    
    # Solve with Algorithm X using Dancing Links
    solution_rows = algorithm_x(matrix, metrics)
    
    if solution_rows:
        # Decode the solution back to a Sudoku board
        decode_solution(board_copy, row_info, solution_rows)
        result = True
    else:
        result = False
    
    metrics.set_time(time.time() - start_time)
    return board_copy, metrics.to_dict(), result

def encode_exact_cover(board):
    """
    Encode a Sudoku board as an exact cover problem.
    Returns the sparse matrix and information about what each row represents.
    """
    # There are 4 constraints for each cell:
    # 1. Each cell must contain exactly one number
    # 2. Each row must contain each number exactly once
    # 3. Each column must contain each number exactly once
    # 4. Each 3x3 box must contain each number exactly once
    
    # Create column headers
    header = ColumnNode("header")
    column_nodes = []
    
    # Cell constraints: 9x9 = 81 columns
    for i in range(81):
        column = ColumnNode(f"cell_r{i//9}c{i%9}")
        column_nodes.append(column)
        append_column(header, column)
    
    # Row constraints: 9 rows x 9 digits = 81 columns
    for i in range(81):
        column = ColumnNode(f"row_r{i//9}d{i%9+1}")
        column_nodes.append(column)
        append_column(header, column)
    
    # Column constraints: 9 columns x 9 digits = 81 columns
    for i in range(81):
        column = ColumnNode(f"col_c{i//9}d{i%9+1}")
        column_nodes.append(column)
        append_column(header, column)
    
    # Box constraints: 9 boxes x 9 digits = 81 columns
    for i in range(81):
        box_row, box_col = (i // 9) // 3, (i // 9) % 3
        column = ColumnNode(f"box_b{box_row*3+box_col}d{i%9+1}")
        column_nodes.append(column)
        append_column(header, column)
    
    # Now create the rows - each row represents placing digit d in cell (r,c)
    row_info = []  # Store information about what each row represents
    
    for r in range(9):
        for c in range(9):
            # If the cell is already filled, only create a row for that digit
            if board[r][c] != 0:
                d = board[r][c]
                add_row(column_nodes, row_info, r, c, d)
            else:
                # Otherwise, create a row for each possible digit 1-9
                for d in range(1, 10):
                    add_row(column_nodes, row_info, r, c, d)
    
    return header, row_info

def add_row(column_nodes, row_info, r, c, d):
    """Add a row to the exact cover matrix for placing digit d in cell (r,c)."""
    # Create a unique identifier for this row
    row_id = len(row_info)
    row_info.append((r, c, d))
    
    # Create 4 nodes for the constraints this placement satisfies
    cell_node = DancingNode(column_nodes[r*9 + c], row_id)
    row_node = DancingNode(column_nodes[81 + r*9 + (d-1)], row_id)
    col_node = DancingNode(column_nodes[162 + c*9 + (d-1)], row_id)
    box_node = DancingNode(column_nodes[243 + (r//3*3 + c//3)*9 + (d-1)], row_id)
    
    # Connect the 4 nodes horizontally
    connect_horizontal(cell_node, row_node)
    connect_horizontal(row_node, col_node)
    connect_horizontal(col_node, box_node)
    
    # Add nodes to their respective columns
    append_to_column(cell_node)
    append_to_column(row_node)
    append_to_column(col_node)
    append_to_column(box_node)

def connect_horizontal(left_node, right_node):
    """Connect two nodes horizontally in the linked list."""
    left_node.right = right_node
    right_node.left = left_node

def append_column(header, column):
    """Add a column to the header row."""
    column.right = header
    column.left = header.left
    header.left.right = column
    header.left = column

def append_to_column(node):
    """Add a node to the bottom of its column."""
    column = node.column
    node.up = column.up
    node.down = column
    column.up.down = node
    column.up = node
    column.size += 1

def cover_column(column):
    """
    Remove a column from the header row and all rows that have a 1 in this column
    from other columns.
    """
    column.right.left = column.left
    column.left.right = column.right
    
    row = column.down
    while row != column:
        right = row.right
        while right != row:
            right.up.down = right.down
            right.down.up = right.up
            right.column.size -= 1
            right = right.right
        row = row.down

def uncover_column(column):
    """Undo a column cover operation."""
    row = column.up
    while row != column:
        left = row.left
        while left != row:
            left.column.size += 1
            left.up.down = left
            left.down.up = left
            left = left.left
        row = row.up
    
    column.right.left = column
    column.left.right = column

def algorithm_x(header, metrics):
    """
    Solve the exact cover problem using Algorithm X with Dancing Links.
    Returns a list of row IDs that form the solution.
    """
    solution = []
    
    def search():
        metrics.count_node()
        
        # If the header is empty, we've found a solution
        if header.right == header:
            return True
        
        # Choose column with smallest size (most constraints)
        column = select_column()
        
        # Cover the chosen column
        cover_column(column)
        
        # Try each row in this column
        row = column.down
        while row != column:
            # Add this row to the solution
            solution.append(row.row_id)
            metrics.count_assignment()
            
            # Cover all columns in this row
            right = row.right
            while right != row:
                cover_column(right.column)
                right = right.right
            
            # Recursively search
            if search():
                return True
            
            # If this row didn't lead to a solution, backtrack
            metrics.count_backtrack()
            solution.pop()
            
            # Uncover columns in reverse order
            left = row.left
            while left != row:
                uncover_column(left.column)
                left = left.left
            
            row = row.down
        
        # Uncover the column for the next iteration
        uncover_column(column)
        return False
    
    def select_column():
        """Select the column with the smallest size (most constrained)."""
        min_size = float('inf')
        chosen_column = None
        
        column = header.right
        while column != header:
            if column.size < min_size:
                min_size = column.size
                chosen_column = column
            column = column.right
        
        return chosen_column
    
    search()
    return solution

def decode_solution(board, row_info, solution_rows):
    """
    Convert the solution rows back to a Sudoku board.
    Modifies the board in-place.
    """
    for row_id in solution_rows:
        r, c, d = row_info[row_id]
        board[r][c] = d
