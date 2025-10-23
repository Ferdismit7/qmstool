'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OpsSummary {
  businessArea: string;
  overallProgress: number;
  overallHealthScore: number;
  minorChallenges: number;
  majorChallenges: number;
}

export default function OperationsSummaryPage() {
  const router = useRouter();
  const [data, setData] = useState<OpsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCardClick = (businessArea: string) => {
    router.push(`/management-report?businessArea=${encodeURIComponent(businessArea)}`);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8 text-brand-white">Operations Summary</h1>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-6">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map(area => (
            <div 
              key={area.businessArea} 
              className="bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-800 cursor-pointer hover:border-brand-primary/50 hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={() => handleCardClick(area.businessArea)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{area.businessArea}</h2>
                <span className="text-sm text-gray-400">Health Score</span>
              </div>
              
              {/* Overall Health Score */}
              <div className="flex items-center gap-4">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-2xl font-bold ${getHealthScoreColor(area.overallHealthScore)}`}>
                      {area.overallHealthScore}%
                    </span>
                    <span className="text-xs text-gray-400">Health Score</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressBarColor(area.overallHealthScore)}`}
                      style={{ width: `${area.overallHealthScore}%` }}
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

              {/* Click indicator */}
              <div className="text-center mt-2">
                <span className="text-xs text-brand-primary/70">Click to view Management Report</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 