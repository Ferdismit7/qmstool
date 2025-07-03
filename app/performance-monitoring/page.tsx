'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PerformanceMonitoringTable from '@/app/components/PerformanceMonitoringTable';
import { FaPlus } from 'react-icons/fa';

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

export default function PerformanceMonitoringPage() {
  const router = useRouter();
  const [controls, setControls] = useState<PerformanceMonitoringControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchControls = async () => {
    try {
      const response = await fetch('/api/performance-monitoring');
      if (!response.ok) throw new Error('Failed to fetch controls');
      const data = await response.json();
      setControls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const handleEdit = (control: PerformanceMonitoringControl) => {
    router.push(`/performance-monitoring/${control.id}/edit`);
  };

  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="w-full px-2 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-white mb-2">Performance Monitoring</h1>
          <p className="text-brand-gray2">Manage your performance monitoring controls</p>
        </div>
        <button
          onClick={() => router.push('/performance-monitoring/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-brand-white hover:bg-brand-blue/90 transition-colors"
        >
          <FaPlus /> Add Control
        </button>
      </div>

      <PerformanceMonitoringTable
        controls={controls}
        loading={loading}
        onEdit={handleEdit}
        refresh={fetchControls}
      />
    </div>
  );
} 