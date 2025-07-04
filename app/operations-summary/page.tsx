'use client';

import { useEffect, useState } from 'react';

interface OpsSummary {
  businessArea: string;
  overallProgress: number;
  minorChallenges: number;
  majorChallenges: number;
}

export default function OperationsSummaryPage() {
  const [data, setData] = useState<OpsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/operations-summary');
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch summary');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-brand-white">Operations Summary</h1>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-6">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map(area => (
            <div key={area.businessArea} className="bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{area.businessArea}</h2>
                <span className="text-sm text-gray-400">Progress</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl font-bold text-brand-white">{area.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                      style={{ width: `${area.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex flex-col items-center">
                  <span className="text-yellow-400 text-lg font-bold">{area.minorChallenges}</span>
                  <span className="text-xs text-gray-400">Minor Challenges</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-red-500 text-lg font-bold">{area.majorChallenges}</span>
                  <span className="text-xs text-gray-400">Major Challenges</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 