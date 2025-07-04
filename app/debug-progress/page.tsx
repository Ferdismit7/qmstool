'use client';

import { useState, useEffect } from 'react';

export default function DebugProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test-business-process-data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fixPercentages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fix-business-process-percentages', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to fix percentages');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fix percentages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Progress Calculation</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Refresh Data
        </button>
        <button
          onClick={fixPercentages}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Fix Invalid Percentages
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Calculation Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Total Processes:</strong> {data.calculation?.totalProcesses || data.totalProcesses}
              </div>
              <div>
                <strong>Total Percentage:</strong> {data.calculation?.totalPercentage || 'N/A'}
              </div>
              <div>
                <strong>Calculated Overall Progress:</strong> {data.calculation?.calculatedOverallProgress || data.calculatedOverallProgress}%
              </div>
              <div>
                <strong>Average:</strong> {data.calculation?.average || 'N/A'}
              </div>
              {data.fixedCount !== undefined && (
                <div>
                  <strong>Fixed Processes:</strong> {data.fixedCount}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Process Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">ID</th>
                    <th className="border border-gray-300 px-4 py-2">Process Name</th>
                    <th className="border border-gray-300 px-4 py-2">Status Percentage</th>
                    <th className="border border-gray-300 px-4 py-2">Valid?</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.processes || []).map((process: any) => {
                    const percentage = Number(process.status_percentage);
                    const isValid = !isNaN(percentage) && percentage >= 0 && percentage <= 100;
                    return (
                      <tr key={process.id} className={!isValid ? 'bg-red-100' : ''}>
                        <td className="border border-gray-300 px-4 py-2">{process.id}</td>
                        <td className="border border-gray-300 px-4 py-2">{process.process_name}</td>
                        <td className="border border-gray-300 px-4 py-2">{process.status_percentage}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                            {isValid ? '✓' : '✗'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 