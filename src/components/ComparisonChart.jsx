import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ComparisonChart = ({ results }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    if (!results || results.length === 0) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    
    // Extract algorithms and metrics
    const algorithms = results.map(r => r.algorithm);
    const times = results.map(r => r.time);
    const nodes = results.map(r => r.nodes);
    const backtracks = results.map(r => r.backtracks);
    
    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: algorithms,
        datasets: [
          {
            label: 'Time (s)',
            data: times,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Nodes (scaled)',
            data: nodes.map(n => n / 100), // Scale down for visualization
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Backtracks (scaled)',
            data: backtracks.map(b => b / 100), // Scale down for visualization
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value (time in seconds, others scaled)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Algorithm'
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [results]);
  
  if (!results || results.length === 0) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">No comparison data available</div>;
  }
  
  return (
    <div className="comparison-chart bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Algorithm Comparison</h3>
      <div className="chart-container" style={{ height: '400px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <p className="chart-note text-xs text-gray-500 dark:text-gray-400 mt-2">
        Note: Node and backtrack counts are scaled down by 100 for better visualization.
      </p>
    </div>
  );
};

export default ComparisonChart;
