# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS # For handling Cross-Origin Resource Sharing
from solver import solve_sudoku_board

app = Flask(__name__)
CORS(app) # Allows requests from the React app (running on a different port)

@app.route('/solve-sudoku', methods=['POST'])
def handle_solve_sudoku():
    data = request.get_json()
    
    if not data or 'board' not in data:
        return jsonify({"error": "Invalid request: 'board' is required."}), 400
    
    board = data['board']

    # Basic validation of the board structure (optional but good)
    if not isinstance(board, list) or len(board) != 9:
        return jsonify({"error": "Board must be a list of 9 rows."}), 400
    for row in board:
        if not isinstance(row, list) or len(row) != 9:
            return jsonify({"error": "Each row must be a list of 9 cells."}), 400
        for cell in row:
            if not isinstance(cell, int) or not (0 <= cell <= 9): # Assuming 0 for empty
                 return jsonify({"error": "Cells must be integers between 0 and 9."}), 400


    # Create a mutable copy for the solver if it modifies in place
    board_to_solve = [row[:] for row in board]

    if solve_sudoku_board(board_to_solve):
        return jsonify({"solution": board_to_solve, "message": "Sudoku solved successfully!"})
    else:
        return jsonify({"error": "No solution exists for the given Sudoku board.", "board_received": board}), 422 # 422 Unprocessable Entity

if __name__ == '__main__':
    app.run(debug=True, port=5001) # Run on a different port than your React app, e.g., 5001