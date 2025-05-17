# backend/solver.py
import json

def solve_sudoku_board(board):
    # Find an empty cell
    empty_cell = find_empty_cell(board)
    if not empty_cell:
        return True  # Puzzle solved

    row, col = empty_cell

    # Try each number
    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num

            # Recursively try to solve the rest
            if solve_sudoku_board(board):
                return True

            # If we get here, this number didn't work
            board[row][col] = 0  # Backtrack

    return False

def find_empty_cell(board):
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0: # Assuming 0 represents an empty cell
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
    box_row_start, box_col_start = 3 * (row // 3), 3 * (col // 3)
    for i in range(box_row_start, box_row_start + 3):
        for j in range(box_col_start, box_col_start + 3):
            if board[i][j] == num:
                return False
    return True

# You can add a helper function if needed to test this file directly
if __name__ == '__main__':
    example_board = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
    if solve_sudoku_board(example_board):
        print("Solved board:")
        for row in example_board:
            print(row)
    else:
        print("No solution exists.")