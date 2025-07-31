'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';

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

export default function PerformanceMonitoringControlDetailPage({
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'on-track':
      case 'on track':
        return 'bg-blue-500 text-white';
      case 'minor challenges':
        return 'bg-yellow-500 text-white';
      case 'major challenges':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'on-track':
      case 'on track':
        return 'bg-blue-500 text-white';
      case 'minor challenges':
        return 'bg-yellow-500 text-white';
      case 'major challenges':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!control) return <div className="text-center py-4">Control not found</div>;

  return (
    <div className="w-full px-2 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/performance-monitoring"
            className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Performance Monitoring
          </Link>
        </div>
        <Link
          href={`/performance-monitoring/${control.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-brand-white hover:bg-brand-blue/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Control
        </Link>
      </div>

      {/* Control Details */}
      <div className="bg-brand-dark/50 rounded-lg border border-brand-gray1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-white mb-2">Performance Monitoring Control Details</h1>
          <p className="text-brand-gray2">View detailed information about this performance monitoring control</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Business Area</label>
            <p className="text-brand-white font-medium">{control.business_area}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Sub Business Area</label>
            <p className="text-brand-white font-medium">{control.sub_business_area}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Report Name</label>
            <p className="text-brand-white font-medium">{control.Name_reports}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Document Type</label>
            <p className="text-brand-white font-medium">{control.doc_type}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Priority</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(control.priority)}`}>
              {control.priority}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(control.doc_status)}`}>
              {control.doc_status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Progress</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgressColor(control.progress)}`}>
              {control.progress}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Status Percentage</label>
            <p className="text-brand-white font-medium">{control.status_percentage}%</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Target Date</label>
            <p className="text-brand-white font-medium">
              {control.target_date ? new Date(control.target_date).toLocaleDateString() : 'Not set'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Frequency</label>
            <p className="text-brand-white font-medium">{control.frequency}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-1">Responsible Persons</label>
            <p className="text-brand-white font-medium">{control.responsible_persons}</p>
          </div>
        </div>

        {/* Proof */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-gray3 mb-2">Proof</label>
          <div className="bg-brand-gray1/30 rounded-lg p-4">
            <p className="text-brand-white">{control.proof}</p>
          </div>
        </div>

        {/* Remarks */}
        {control.remarks && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-gray3 mb-2">Remarks</label>
            <div className="bg-brand-gray1/30 rounded-lg p-4">
              <p className="text-brand-white">{control.remarks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 