'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';
import { useRouter } from 'next/navigation';
import { clientTokenUtils } from '@/lib/auth';

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
  const router = useRouter();
  const [system, setSystem] = useState<CustomerFeedbackSystem | null>(null);
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
    let isMounted = true;

    const fetchSystem = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        // Get token for Authorization header (fallback if cookies don't work)
        let token = clientTokenUtils.getToken();
        if (!token) {
          // Retry getting token after a short delay, as it might not be immediately available on page load
          await new Promise(resolve => setTimeout(resolve, 100));
          token = clientTokenUtils.getToken();
        }

        // If no token, user might be logging out - don't make request
        if (!token) {
          return;
        }

        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/customer-feedback-systems/${id}`, {
          credentials: 'include', // Include cookies for authentication
          headers
        });

        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        if (!response.ok) {
          // If 401, check if token was cleared (user is logging out)
          if (response.status === 401) {
            const currentToken = clientTokenUtils.getToken();
            if (!currentToken) {
              // User is logging out, don't set error - just return
              return;
            }
            if (isMounted) {
              setError('You do not have permission to view this customer feedback system. Please ensure you have access to the system\'s business area.');
            }
            return;
          } else if (response.status === 404) {
            if (isMounted) {
              setError('Customer feedback system not found. It may have been deleted or you do not have access to it.');
            }
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            if (isMounted) {
              setError(errorData.error || 'Failed to fetch customer feedback system');
            }
            return;
          }
        }
        
        const data = await response.json();
        if (data.success && isMounted) {
          setSystem(data.data);
        } else if (isMounted) {
          setError(data.error || 'Failed to fetch customer feedback system');
        }
      } catch (error) {
        // Only set error if component is still mounted and it's not a logout-related issue
        if (isMounted) {
          const token = clientTokenUtils.getToken();
          if (token) {
            console.error('Error fetching customer feedback system:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch customer feedback system');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSystem();

    // Cleanup function to mark component as unmounted
    return () => {
      isMounted = false;
    };
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

  const handleDeleteConfirm = async () => {
    if (!system) return;

    try {
      const response = await fetch('/api/customer-feedback-systems/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: system.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer feedback system');
      }

      await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Customer feedback system successfully deleted'
      });
      
      // Redirect to the list page after successful deletion
      setTimeout(() => {
        router.push('/customer-feedback-systems');
      }, 1500);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete customer feedback system'
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
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to customer feedback systems"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Customer Feedback System Details</h1>
            <p className="text-brand-gray3 mt-1">{`System ${system.id}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/customer-feedback-systems/${system.id}/edit`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
          >
            <FiEdit2 size={12} />
            Edit System
          </Link>
          <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiTrash2 size={12} />
          Delete System
        </button>
        </div>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`System ${system?.id}` || ''}
        itemType="customer feedback system"
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