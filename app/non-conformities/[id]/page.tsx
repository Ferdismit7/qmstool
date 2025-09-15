'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';

interface NonConformity {
  id: number;
  business_area: string;
  sub_business_area?: string;
  nc_number?: string;
  nc_type?: string;
  description?: string;
  root_cause?: string;
  corrective_action?: string;
  responsible_person?: string;
  target_date?: string;
  completion_date?: string;
  status?: string;
  priority?: string;
  impact_level?: string;
  verification_method?: string;
  effectiveness_review?: string;
  lessons_learned?: string;
  related_documents?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function NonConformityDetail({ params }: { params: Promise<{ id: string }> }) {
  const [nonConformity, setNonConformity] = useState<NonConformity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNonConformity = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/non-conformities/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch non-conformity');
        }
        
        const data = await response.json();
        if (data.success) {
          setNonConformity(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch non-conformity');
        }
      } catch (error) {
        console.error('Error fetching non-conformity:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch non-conformity');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNonConformity();
  }, [params]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
      case 'ACTIVE':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
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

  const getImpactColor = (impact: string) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (nonConformity?.file_url) {
      const fileId = extractFileIdFromUrl(nonConformity.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(nonConformity.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (nonConformity?.file_url) {
      const fileId = extractFileIdFromUrl(nonConformity.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(nonConformity.file_url, '_blank');
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

  if (!nonConformity) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Non-conformity not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/non-conformities"
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to non-conformities"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Non-Conformity Details</h1>
            <p className="text-brand-gray3 mt-1">{nonConformity.nc_number || `NC-${nonConformity.id}`}</p>
          </div>
        </div>
        <Link
          href={`/non-conformities/${nonConformity.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Non-Conformity
        </Link>
      </div>

      {/* Non-Conformity Details */}
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
                <p className="text-brand-white">{nonConformity.business_area}</p>
                {nonConformity.sub_business_area && (
                  <p className="text-sm text-brand-gray3">{nonConformity.sub_business_area}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">NC Number</label>
                <p className="text-brand-white">{nonConformity.nc_number || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">NC Type</label>
                <p className="text-brand-white">{nonConformity.nc_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(nonConformity.status || '')}`}>
                  {nonConformity.status || 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Priority & Impact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Priority & Impact
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(nonConformity.priority || '')}`}>
                  {nonConformity.priority || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Impact Level</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(nonConformity.impact_level || '')}`}>
                  {nonConformity.impact_level || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Responsible Person</label>
                <p className="text-brand-white">{nonConformity.responsible_person || 'Not specified'}</p>
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
                <label className="text-sm font-medium text-brand-gray3">Target Date</label>
                <p className="text-brand-white">
                  {nonConformity.target_date ? (() => {
                    const date = new Date(nonConformity.target_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Completion Date</label>
                <p className="text-brand-white">
                  {nonConformity.completion_date ? (() => {
                    const date = new Date(nonConformity.completion_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not completed'}
                </p>
              </div>
              {nonConformity.file_name && (
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Attached File</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-brand-white">
                        <FiFileText size={16} />
                        <span className="text-sm">{nonConformity.file_name}</span>
                      </div>
                      {nonConformity.file_size && (
                        <p className="text-xs text-brand-gray3 mt-1">
                          {(nonConformity.file_size / 1024 / 1024).toFixed(2)} MB
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

        {/* Description */}
        {nonConformity.description && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Description</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.description}
            </p>
          </div>
        )}

        {/* Root Cause */}
        {nonConformity.root_cause && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Root Cause</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.root_cause}
            </p>
          </div>
        )}

        {/* Corrective Action */}
        {nonConformity.corrective_action && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Corrective Action</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.corrective_action}
            </p>
          </div>
        )}

        {/* Verification Method */}
        {nonConformity.verification_method && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Verification Method</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.verification_method}
            </p>
          </div>
        )}

        {/* Effectiveness Review */}
        {nonConformity.effectiveness_review && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Effectiveness Review</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.effectiveness_review}
            </p>
          </div>
        )}

        {/* Lessons Learned */}
        {nonConformity.lessons_learned && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Lessons Learned</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.lessons_learned}
            </p>
          </div>
        )}

        {/* Related Documents */}
        {nonConformity.related_documents && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Related Documents</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.related_documents}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
