from .algorithms import naive, mrv, degree, combined, forward_checking, mac, random_restart, dancing_links

def solve_sudoku_board(board, algorithm="Naive"):
    """
    Solve a Sudoku board using the specified algorithm.
    
    Args:
        board: 9x9 grid with 0s for empty cells
        algorithm: Algorithm to use (default is "Naive")
    
    Returns:
        Tuple (solved_board, metrics, success)
    """
    SOLVERS = {
        "Naive": naive.solve,
        "MRV": mrv.solve,
        "Degree": degree.solve,
        "Combined": combined.solve,
        "ForwardChecking": forward_checking.solve,
        "MAC": mac.solve,
        "RandomRestart": random_restart.solve,
        "DancingLinks": dancing_links.solve
    }
    
    if algorithm not in SOLVERS:
        raise ValueError(f"Unknown algorithm: {algorithm}. Available algorithms: {', '.join(SOLVERS.keys())}")
    
    # Call the solver
    solved_board, metrics, success = SOLVERS[algorithm](board)
    
    return solved_board, metrics, success
