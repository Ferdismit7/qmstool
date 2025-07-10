'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{
    area: string;
  }>;
}

export default function CertificationPage({ params }: PageProps) {
  const router = useRouter();
  const [areaName, setAreaName] = React.useState<string>('');

  React.useEffect(() => {
    const getAreaName = async () => {
      const { area } = await params;
      setAreaName(decodeURIComponent(area));
    };
    getAreaName();
  }, [params]);

  return (
    <div className="container w-full px-2 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-white">{areaName} - Certification</h1>
        <button
          onClick={() => router.back()}
          className="text-brand-white hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto text-brand-white">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Certification Overview</h2>
          <p className="text-brand-gray2 mb-6">
            View and manage certification requirements for {areaName} department.
          </p>
          
          {/* Add your certification content here */}
          <div className="text-gray-400">
            <p>Certification content will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 