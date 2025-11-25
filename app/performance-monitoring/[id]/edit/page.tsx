'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import PerformanceMonitoringForm from '@/app/components/PerformanceMonitoringForm';

interface PerformanceMonitoringControl {
  id: number;
  business_area: string;
  sub_business_area: string;
  Name_reports: string;
  doc_type: string;
  priority: string;
  doc_status: string;
  progress: string;
  status_percentage: number;
  target_date: string;
  proof: string;
  frequency: string;
  responsible_persons: string;
  remarks: string;
}

export default function EditPerformanceMonitoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [control, setControl] = useState<PerformanceMonitoringControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchControl = async () => {
      try {
        const { id } = await params;
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/performance-monitoring/${id}`);
        if (!response.ok) throw new Error('Failed to fetch control');
        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to fetch control');
        }
        setControl(responseData.data);
      } catch (err) {
        console.error('Error fetching control:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch control');
      } finally {
        setLoading(false);
      }
    };

    fetchControl();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Control not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/performance-monitoring/${control?.id || ''}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to control"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Edit Performance Monitoring Control</h1>
            <p className="text-brand-gray3 mt-1">{control.Name_reports}</p>
          </div>
        </div>
        <Link
          href={`/performance-monitoring/${control?.id || ''}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiX size={12} />
          Cancel
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Performance Monitoring Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <PerformanceMonitoringForm mode="edit" control={control} />
      </div>
    </div>
  );
} 