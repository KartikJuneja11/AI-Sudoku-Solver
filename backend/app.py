from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from .solver import solve_sudoku_board
import json
import pandas as pd
import os
import matplotlib
matplotlib.use('Agg')  # Set non-interactive backend before importing plt
import matplotlib.pyplot as plt

# Initialize Flask app with proper static folder configuration
app = Flask(__name__, static_folder='results', static_url_path='/static_results')
CORS(app)  # Allows requests from the React app

# Directory for storing results
RESULTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results")
if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR, exist_ok=True)

@app.route('/solve-sudoku', methods=['POST'])
def handle_solve_sudoku():
    data = request.get_json()
    
    if not data or 'board' not in data:
        return jsonify({"error": "Invalid request: 'board' is required."}), 400
    
    board = data['board']
    algorithm = data.get('algorithm', 'Naive')
    
    # Basic validation of the board structure
    if not isinstance(board, list) or len(board) != 9:
        return jsonify({"error": "Board must be a list of 9 rows."}), 400
    for row in board:
        if not isinstance(row, list) or len(row) != 9:
            return jsonify({"error": "Each row must be a list of 9 cells."}), 400
        for cell in row:
            if not isinstance(cell, int) or not (0 <= cell <= 9):
                return jsonify({"error": "Cells must be integers between 0 and 9."}), 400

    # Create a mutable copy for the solver
    board_to_solve = [row[:] for row in board]
    
    try:
        solved_board, metrics, success = solve_sudoku_board(board_to_solve, algorithm)
        
        if success:
            # Save metrics to CSV for visualization
            difficulty = data.get('difficulty', 'Unknown')
            save_metrics_to_csv(metrics, difficulty)
            
            return jsonify({
                "solution": solved_board,
                "metrics": metrics,
                "message": "Sudoku solved successfully!"
            })
        else:
            return jsonify({
                "error": "No solution exists for the given Sudoku board.",
                "board_received": board,
                "metrics": metrics
            }), 422
    except Exception as e:
        return jsonify({"error": f"Solver error: {str(e)}"}), 500

@app.route('/compare-algorithms', methods=['POST'])
def compare_algorithms():
    data = request.get_json()
    
    if not data or 'board' not in data:
        return jsonify({"error": "Invalid request: 'board' is required."}), 400
    
    board = data['board']
    algorithms = data.get('algorithms', ['Naive', 'MRV', 'Degree', 'Combined', 'ForwardChecking', 'MAC', 'RandomRestart', 'DancingLinks'])
    difficulty = data.get('difficulty', 'Unknown')
    
    results = []
    for algorithm in algorithms:
        board_copy = [row[:] for row in board]
        solved_board, metrics, success = solve_sudoku_board(board_copy, algorithm)
        
        if success:
            metrics['difficulty'] = difficulty
            save_metrics_to_csv(metrics, difficulty)
            results.append(metrics)
    
    return jsonify({
        "results": results,
        "message": f"Compared {len(results)} algorithms successfully!"
    })

@app.route('/plot-image/<filename>', methods=['GET'])
def get_plot_image(filename):
    """Serve plot images with proper MIME type"""
    return send_from_directory(RESULTS_DIR, filename, mimetype='image/png')

@app.route('/visualize', methods=['GET'])
def visualize_metrics():
    # Check if results.csv exists
    results_file = os.path.join(RESULTS_DIR, 'results.csv')
    if not os.path.exists(results_file):
        return jsonify({"error": "No results data available for visualization."}), 404
    
    # Generate visualizations using pandas/matplotlib
    try:
        df = pd.read_csv(results_file)
        
        # Create time vs difficulty visualization
        plt.figure(figsize=(10, 6))
        for solver in df['algorithm'].unique():
            sub = df[df['algorithm'] == solver]
            plt.plot(sub['difficulty'], sub['time'], marker='o', label=solver)
        plt.xlabel('Difficulty')
        plt.ylabel('Time (seconds)')
        plt.title('Solver Time vs Difficulty')
        plt.legend()
        time_plot_path = os.path.join(RESULTS_DIR, 'time_vs_difficulty.png')
        plt.savefig(time_plot_path)
        print(f"Generated plot: {time_plot_path}")  # Debug output
        
        # Create nodes vs difficulty visualization
        plt.figure(figsize=(10, 6))
        for solver in df['algorithm'].unique():
            sub = df[df['algorithm'] == solver]
            plt.plot(sub['difficulty'], sub['nodes'], marker='o', label=solver)
        plt.xlabel('Difficulty')
        plt.ylabel('Nodes')
        plt.title('Solver Nodes vs Difficulty')
        plt.legend()
        nodes_plot_path = os.path.join(RESULTS_DIR, 'nodes_vs_difficulty.png')
        plt.savefig(nodes_plot_path)
        print(f"Generated plot: {nodes_plot_path}")  # Debug output
        
        # Return URLs that use our dedicated image endpoint
        return jsonify({
            "message": "Visualizations generated successfully!",
            "plots": [
                f"/plot-image/time_vs_difficulty.png",
                f"/plot-image/nodes_vs_difficulty.png"
            ]
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Visualization error: {str(e)}"}), 500

def save_metrics_to_csv(metrics, difficulty):
    metrics_dict = metrics.copy()
    metrics_dict['difficulty'] = difficulty
    
    # Create or append to the CSV file
    results_file = os.path.join(RESULTS_DIR, 'results.csv')
    mode = 'a' if os.path.exists(results_file) else 'w'
    
    df = pd.DataFrame([metrics_dict])
    df.to_csv(results_file, mode=mode, header=(mode=='w'), index=False)

@app.route('/results', methods=['GET'])
def get_results():
    # Return the results CSV as JSON
    results_file = os.path.join(RESULTS_DIR, 'results.csv')
    if not os.path.exists(results_file):
        return jsonify({"error": "No results data available."}), 404
    
    df = pd.read_csv(results_file)
    return jsonify({"results": df.to_dict(orient='records')})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
