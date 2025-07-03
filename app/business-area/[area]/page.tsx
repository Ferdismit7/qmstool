'use client';

import { useRouter } from 'next/navigation';

interface PageProps {
  params: {
    area: string;
  };
}

export default function BusinessAreaPage({ params }: PageProps) {
  const router = useRouter();
  const areaName = decodeURIComponent(params.area);

  const handleCardClick = (type: 'certification' | 'recertification') => {
    router.push(`/business-area/${encodeURIComponent(areaName)}/${type}`);
  };

  return (
    <div className="container w-full px-2 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-white">{areaName}</h1>
        <button
          onClick={() => router.back()} 
          className="text-brand-white hover:text-white transition-colors"
        >
          ← Back 
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Certification Card */}
        <button
          onClick={() => handleCardClick('certification')}
          className="bg-gray-800 rounded-lg shadow-md p-8 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">Certification</h2>
          <p className="text-gray-400">
            View and manage certification requirements and progress for {areaName}
          </p>
        </button>

        {/* Recertification Card */}
        <button
          onClick={() => handleCardClick('recertification')}
          className="bg-gray-800 rounded-lg shadow-md p-8 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">Recertification</h2>
          <p className="text-gray-400">
            View and manage recertification requirements and progress for {areaName}
          </p>
        </button>
      </div>
    </div>
  );
} 