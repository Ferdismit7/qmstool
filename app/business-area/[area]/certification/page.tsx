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

      <div className="max-w-6xl mx-auto text-brand-white space-y-6">
        {/* Certification Overview */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Certification Overview</h2>
          <p className="text-brand-gray2 mb-6">
            View and manage certification requirements for {areaName} department.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-brand-white mb-2">ISO 9001 Requirements</h3>
              <p className="text-brand-gray2 text-sm">Quality management system standards and compliance requirements.</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-brand-white mb-2">Documentation</h3>
              <p className="text-brand-gray2 text-sm">Required documentation and process procedures.</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-brand-white mb-2">Training Requirements</h3>
              <p className="text-brand-gray2 text-sm">Staff training and competency development programs.</p>
            </div>
          </div>
        </div>

        {/* Training Sessions Component */}
        <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-lg border border-brand-dark/20 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-brand-white">Training Sessions</h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors">
              Add Session
            </button>
          </div>
          <div className="text-brand-gray2 text-center py-8">
            <p>Training sessions functionality will be implemented here.</p>
            <p className="text-sm">This will allow you to manage ISO 9001 training sessions for {areaName}.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 