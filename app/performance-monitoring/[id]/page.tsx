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
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/performance-monitoring/${id}`);
        if (!response.ok) throw new Error('Failed to fetch control');
        const data = await response.json();
        setControl(data);
      } catch (err) {
        console.error('Error fetching control:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch control');
      } finally {
        setLoading(false);
      }
    };

    fetchControl();
  }, [params]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'FINISHED':
        return 'bg-green-100 text-green-800';
      case 'ON-TRACK':
      case 'ON TRACK':
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'MINOR CHALLENGES':
      case 'ON_HOLD':
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAJOR CHALLENGES':
      case 'EXPIRED':
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toUpperCase()) {
      case 'COMPLETED':
      case 'FINISHED':
        return 'bg-green-100 text-green-800';
      case 'ON-TRACK':
      case 'ON TRACK':
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'NOT_STARTED':
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'MINOR CHALLENGES':
      case 'MAJOR CHALLENGES':
      case 'ON_HOLD':
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            href="/performance-monitoring"
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to performance monitoring"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Performance Monitoring Control</h1>
            <p className="text-brand-gray3 mt-1">{control.Name_reports}</p>
          </div>
        </div>
        <Link
          href={`/performance-monitoring/${control.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Control
        </Link>
      </div>

      {/* Control Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Business Area</label>
                <p className="text-sm text-brand-white mt-1">{control.business_area}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Sub Business Area</label>
                <p className="text-sm text-brand-white mt-1">{control.sub_business_area}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Report Name</label>
                <p className="text-sm text-brand-white mt-1">{control.Name_reports}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Document Type</label>
                <p className="text-sm text-brand-white mt-1">{control.doc_type}</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Status & Progress
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Priority</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(control.priority)}`}>
                    {control.priority}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(control.doc_status)}`}>
                    {control.doc_status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Progress</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(control.progress)}`}>
                    {control.progress}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status Percentage</label>
                <p className="text-sm text-brand-white mt-1">{control.status_percentage}%</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Additional Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Target Date</label>
                <p className="text-sm text-brand-white mt-1">
                  {control.target_date ? (() => {
                    const date = new Date(control.target_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Frequency</label>
                <p className="text-sm text-brand-white mt-1">{control.frequency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Responsible Persons</label>
                <p className="text-sm text-brand-white mt-1">{control.responsible_persons}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {control.remarks && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Remarks</h3>
            <p className="text-sm text-brand-white whitespace-pre-wrap">{control.remarks}</p>
          </div>
        )}

        {/* Proof */}
        {control.proof && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Proof</h3>
            <p className="text-sm text-brand-white whitespace-pre-wrap">{control.proof}</p>
          </div>
        )}
      </div>
    </div>
  );
} 