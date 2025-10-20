'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';

interface CustomerFeedbackSystem {
  id: number;
  business_area: string;
  has_feedback_system: 'Yes' | 'No' | 'Planned';
  document_reference: string;
  last_review_date: string;
  status_percentage: number;
  doc_status: 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started';
  progress: 'To be reviewed' | 'Completed' | 'In progress' | 'New';
  notes: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerFeedbackSystemDetail({ params }: { params: Promise<{ id: string }> }) {
  const [system, setSystem] = useState<CustomerFeedbackSystem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystem = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/customer-feedback-systems/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch customer feedback system');
        }
        
        const data = await response.json();
        if (data.success) {
          setSystem(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch customer feedback system');
        }
      } catch (error) {
        console.error('Error fetching customer feedback system:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch customer feedback system');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystem();
  }, [params]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'OPERATIONAL':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
      case 'DEVELOPMENT':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'SURVEY':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLAINT':
        return 'bg-red-100 text-red-800';
      case 'SUGGESTION':
        return 'bg-green-100 text-green-800';
      case 'COMPLIMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (system?.file_url) {
      const fileId = extractFileIdFromUrl(system.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(system.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (system?.file_url) {
      const fileId = extractFileIdFromUrl(system.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(system.file_url, '_blank');
      }
    }
  };

  if (isLoading) {
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

  if (!system) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Customer feedback system not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/customer-feedback-systems"
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to customer feedback systems"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Customer Feedback System Details</h1>
            <p className="text-brand-gray3 mt-1">{system.system_name || `System ${system.id}`}</p>
          </div>
        </div>
        <Link
          href={`/customer-feedback-systems/${system.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit System
        </Link>
      </div>

      {/* System Details */}
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
                <p className="text-brand-white">{system.business_area}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Has Feedback System</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(system.has_feedback_system || '')}`}>
                  {system.has_feedback_system || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Document Reference</label>
                <p className="text-brand-white">{system.document_reference || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Status & Performance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Status & Performance
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Document Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(system.doc_status || '')}`}>
                  {system.doc_status || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Progress</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(system.progress || '')}`}>
                  {system.progress || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status Percentage</label>
                <p className="text-brand-white font-medium">{system.status_percentage || 0}%</p>
              </div>
            </div>
          </div>

          {/* Dates & File Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Dates & Files
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Last Review Date</label>
                <p className="text-brand-white">
                  {system.last_review_date ? (() => {
                    const date = new Date(system.last_review_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              {system.file_name && (
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Attached File</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-brand-white">
                        <FiFileText size={16} />
                        <span className="text-sm">{system.file_name}</span>
                      </div>
                      {system.file_size && (
                        <p className="text-xs text-brand-gray3 mt-1">
                          {(system.file_size / 1024 / 1024).toFixed(2)} MB
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
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {system.notes && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Notes</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {system.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}