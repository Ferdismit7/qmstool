'use client';

import React, { useEffect, useState } from 'react';
import PerformanceMonitoringForm from '@/app/components/PerformanceMonitoringForm';
import { FullScreenLoadingSpinner } from '@/app/components/ui/LoadingSpinner';

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
        const response = await fetch(`/api/performance-monitoring/${id}`);
        if (!response.ok) throw new Error('Failed to fetch control');
        const data = await response.json();
        setControl(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchControl();
  }, [params]);

  if (loading) return <FullScreenLoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!control) return <div className="text-center py-4">Control not found</div>;

  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">Edit Performance Monitoring Control</h1>
        <p className="text-brand-gray3">Update the performance monitoring control details</p>
      </div>
      <PerformanceMonitoringForm mode="edit" control={control} />
    </div>
  );
} 