"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CenteredLoadingSpinner } from '@/app/components/ui/LoadingSpinner';

interface BusinessArea {
  business_area: string;
}

export default function QMSStatusOverviewPage() {
  const router = useRouter();
  const [businessAreas, setBusinessAreas] = useState<BusinessArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessAreas = async () => {
      try {
        const response = await fetch('/api/business-areas');
        if (!response.ok) {
          throw new Error('Failed to fetch business areas');
        }
        const data = await response.json();
        setBusinessAreas(data.data);
      } catch (error) {
        console.error('Error fetching business areas:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessAreas();
  }, []);

  const handleAreaClick = (areaName: string) => {
    router.push(`/business-area/${encodeURIComponent(areaName)}`);
  };

  return (
    <div className="max-w-full py-8 container mx-auto px-2">
      <h1 className="text-3xl font-bold text-brand-white mb-8">QMS Status Overview</h1>
      
      {loading ? (
        <CenteredLoadingSpinner />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessAreas.map((area) => (
            <button
              key={area.business_area}
              onClick={() => handleAreaClick(area.business_area)}
              className="w-full text-left bg-gray-800 rounded-lg shadow-md p-6 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">{area.business_area}</h2>
              <div className="text-gray-400">
                <p>Click to view certification options</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 