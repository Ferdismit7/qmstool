'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';
import { useRouter } from 'next/navigation';

interface BusinessImprovement {
  id: number;
  business_area: string;
  sub_business_area?: string;
  improvement_title?: string;
  improvement_description?: string;
  improvement_type?: string;
  priority?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  status?: string;
  progress_percentage?: number;
  responsible_person?: string;
  improvement_category?: string;
  expected_benefits?: string;
  resources_required?: string;
  implementation_plan?: string;
  success_metrics?: string;
  lessons_learned?: string;
  follow_up_actions?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function BusinessImprovementDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [improvement, setImprovement] = useState<BusinessImprovement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchImprovement = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/business-improvements/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch business improvement');
        }
        
        const data = await response.json();
        if (data.success) {
          setImprovement(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch business improvement');
        }
      } catch (error) {
        console.error('Error fetching business improvement:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch business improvement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImprovement();
  }, [params]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'IMPLEMENTED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'PLANNED':
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'ABANDONED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'PROCESS':
        return 'bg-blue-100 text-blue-800';
      case 'TECHNOLOGY':
        return 'bg-purple-100 text-purple-800';
      case 'ORGANIZATIONAL':
        return 'bg-green-100 text-green-800';
      case 'CUSTOMER':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (improvement?.file_url) {
      const fileId = extractFileIdFromUrl(improvement.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(improvement.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (improvement?.file_url) {
      const fileId = extractFileIdFromUrl(improvement.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(improvement.file_url, '_blank');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!improvement) return;

    try {
      const response = await fetch('/api/business-improvements/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: improvement.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete business improvement');
      }

      await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Business improvement successfully deleted'
      });
      
      // Redirect to the list page after successful deletion
      setTimeout(() => {
        router.push('/business-improvements');
      }, 1500);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete business improvement'
      });
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

  if (!improvement) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Business improvement not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/business-improvements"
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to business improvements"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Business Improvement Details</h1>
            <p className="text-brand-gray3 mt-1">{improvement.improvement_title || `Improvement ${improvement.id}`}</p>
          </div>
        </div>
        <Link
          href={`/business-improvements/${improvement.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Improvement
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiTrash2 size={16} />
          Delete Improvement
        </button>
      </div>

      {/* Improvement Details */}
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
                <p className="text-brand-white">{improvement.business_area}</p>
                {improvement.sub_business_area && (
                  <p className="text-sm text-brand-gray3">{improvement.sub_business_area}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Improvement Type</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(improvement.improvement_type || '')}`}>
                  {improvement.improvement_type || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Category</label>
                <p className="text-brand-white">{improvement.improvement_category || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Responsible Person</label>
                <p className="text-brand-white">{improvement.responsible_person || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Status & Priority
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(improvement.status || '')}`}>
                  {improvement.status || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(improvement.priority || '')}`}>
                  {improvement.priority || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Progress</label>
                <p className="text-brand-white font-medium">{improvement.progress_percentage || 0}%</p>
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
                <label className="text-sm font-medium text-brand-gray3">Target Completion</label>
                <p className="text-brand-white">
                  {improvement.target_completion_date ? (() => {
                    const date = new Date(improvement.target_completion_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Actual Completion</label>
                <p className="text-brand-white">
                  {improvement.actual_completion_date ? (() => {
                    const date = new Date(improvement.actual_completion_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not completed'}
                </p>
              </div>
              {improvement.file_name && (
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Attached File</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-brand-white">
                        <FiFileText size={16} />
                        <span className="text-sm">{improvement.file_name}</span>
                      </div>
                      {improvement.file_size && (
                        <p className="text-xs text-brand-gray3 mt-1">
                          {(improvement.file_size / 1024 / 1024).toFixed(2)} MB
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

        {/* Improvement Description */}
        {improvement.improvement_description && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Improvement Description</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {improvement.improvement_description}
            </p>
          </div>
        )}

        {/* Expected Benefits */}
        {improvement.expected_benefits && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Expected Benefits</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {improvement.expected_benefits}
            </p>
          </div>
        )}

        {/* Implementation Details */}
        <div className="mt-6 pt-6 border-t border-brand-gray1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-white mb-3">Implementation Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Resources Required</label>
                  <p className="text-brand-white bg-brand-gray1/30 p-3 rounded-lg whitespace-pre-wrap">
                    {improvement.resources_required || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Success Metrics</label>
                  <p className="text-brand-white bg-brand-gray1/30 p-3 rounded-lg whitespace-pre-wrap">
                    {improvement.success_metrics || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-white mb-3">Implementation Plan</h3>
              <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
                {improvement.implementation_plan || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Lessons Learned & Follow-up */}
        <div className="mt-6 pt-6 border-t border-brand-gray1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {improvement.lessons_learned && (
              <div>
                <h3 className="text-lg font-semibold text-brand-white mb-3">Lessons Learned</h3>
                <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
                  {improvement.lessons_learned}
                </p>
              </div>
            )}
            {improvement.follow_up_actions && (
              <div>
                <h3 className="text-lg font-semibold text-brand-white mb-3">Follow-up Actions</h3>
                <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
                  {improvement.follow_up_actions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={improvement?.improvement_title || `Improvement ${improvement?.id}` || ''}
        itemType="business improvement"
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
