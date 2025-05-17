import pandas as pd
import matplotlib.pyplot as plt
import os

def plot_metric(df, metric, output_dir="results"):
    """
    Create a plot of the given metric versus difficulty.
    
    Args:
        df: Pandas DataFrame with the metrics data
        metric: Name of the metric to plot (e.g., 'time', 'nodes')
        output_dir: Directory to save the plot
    
    Returns:
        Path to the saved plot file
    """
    plt.figure(figsize=(10, 6))
    
    for solver in df['algorithm'].unique():
        sub = df[df['algorithm'] == solver]
        plt.plot(sub['difficulty'], sub[metric], marker='o', label=solver)
    
    plt.xlabel('Difficulty')
    plt.ylabel(metric.capitalize())
    plt.title(f'{metric.capitalize()} vs Difficulty')
    plt.legend()
    
    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Save the plot
    filename = f"{metric}_vs_difficulty.png"
    filepath = os.path.join(output_dir, filename)
    plt.savefig(filepath)
    plt.close()
    
    return filepath

def plot_all_metrics(csv_file="results/results.csv", output_dir="results"):
    """
    Create plots for all key metrics in the results CSV.
    
    Args:
        csv_file: Path to the results CSV file
        output_dir: Directory to save the plots
    
    Returns:
        List of paths to the saved plot files
    """
    if not os.path.exists(csv_file):
        raise FileNotFoundError(f"Results file not found: {csv_file}")
    
    df = pd.read_csv(csv_file)
    
    # Plot standard metrics
    plots = []
    for metric in ['time', 'nodes', 'backtracks', 'prunes', 'checks', 'assignments']:
        if metric in df.columns:
            plot_path = plot_metric(df, metric, output_dir)
            plots.append(plot_path)
    
    return plots

if __name__ == "__main__":
    # This allows running the script directly to generate plots
    try:
        plots = plot_all_metrics()
        print(f"Generated plots: {plots}")
    except Exception as e:
        print(f"Error generating plots: {e}")
