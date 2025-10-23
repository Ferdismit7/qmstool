'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';
import { useRouter } from 'next/navigation';

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
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function PerformanceMonitoringControlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [control, setControl] = useState<PerformanceMonitoringControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    const fetchControl = async () => {
      try {
        const { id } = await params;
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/performance-monitoring/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch control');
        const data = await response.json();
        // Support both envelope { success, data } and raw object
        setControl(data?.data ?? data ?? null);
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

  const handleDownload = () => {
    if (control?.file_url) {
      const fileId = extractFileIdFromUrl(control.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(control.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (control?.file_url) {
      const fileId = extractFileIdFromUrl(control.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(control.file_url, '_blank');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!control) return;

    try {
      const response = await fetch('/api/performance-monitoring/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: control.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete control');
      }

      await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Performance monitoring control successfully deleted'
      });
      
      // Redirect to the list page after successful deletion
      setTimeout(() => {
        router.push('/performance-monitoring');
      }, 1500);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete control'
      });
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
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiTrash2 size={16} />
          Delete Control
        </button>
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

        {/* Attached File */}
        {control.file_name && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Attached File</h3>
            <div className="bg-brand-gray1 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-brand-white">
                    <FiFileText size={16} />
                    <span className="text-sm">{control.file_name}</span>
                  </div>
                  {control.file_size && (
                    <p className="text-xs text-brand-gray3 mt-1">
                      {(control.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleView}
                    className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                    title="View document"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                    title="Download document"
                  >
                    <FiDownload size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={control?.Name_reports || ''}
        itemType="performance monitoring control"
      />

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
} 