const MetricsTable = ({ metrics }) => {
  if (!metrics) return null;
  
  return (
    <div className="metrics-container bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Solver Performance Metrics</h3>
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-white">
          <tr>
            <th scope="col" className="px-4 py-3 border">Algorithm</th>
            <th scope="col" className="px-4 py-3 border">Time (s)</th>
            <th scope="col" className="px-4 py-3 border">Nodes</th>
            <th scope="col" className="px-4 py-3 border">Backtracks</th>
            <th scope="col" className="px-4 py-3 border">Prunes</th>
            <th scope="col" className="px-4 py-3 border">Checks</th>
            <th scope="col" className="px-4 py-3 border">Assignments</th>
            {metrics.restarts !== undefined && <th scope="col" className="px-4 py-3 border">Restarts</th>}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border dark:bg-gray-800 dark:border-gray-700">
            <td className="px-4 py-3 border">{metrics.algorithm}</td>
            <td className="px-4 py-3 border">{metrics.time.toFixed(4)}</td>
            <td className="px-4 py-3 border">{metrics.nodes}</td>
            <td className="px-4 py-3 border">{metrics.backtracks}</td>
            <td className="px-4 py-3 border">{metrics.prunes || 0}</td>
            <td className="px-4 py-3 border">{metrics.checks || 0}</td>
            <td className="px-4 py-3 border">{metrics.assignments || 0}</td>
            {metrics.restarts !== undefined && <td className="px-4 py-3 border">{metrics.restarts}</td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MetricsTable;
