'use client';

import { useRouter } from 'next/navigation';

interface PageProps {
  params: {
    area: string;
  };
}

export default function RecertificationPage({ params }: PageProps) {
  const router = useRouter();
  const areaName = decodeURIComponent(params.area);

  return (
    <div className="container w-full px-2 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-white">{areaName} - Recertification</h1>
        <button
          onClick={() => router.back()}
          className="text-brand-white hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto text-brand-white">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recertification Overview</h2>
          <p className="text-gray-400 mb-6">
            View and manage recertification requirements for {areaName} department.
          </p>
          
          {/* Add your recertification content here */}
          <div className="text-gray-400">
            <p>Recertification content will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 