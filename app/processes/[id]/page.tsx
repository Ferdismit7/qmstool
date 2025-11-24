'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import DocumentLinkingManager from '../../components/DocumentLinkingManager';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';
import { useRouter } from 'next/navigation';
import { clientTokenUtils } from '@/lib/auth';

interface BusinessDocument {
  id: number;
  document_name: string;
  document_type: string;
  version: string;
  doc_status: string;
  progress: string;
  status_percentage: number;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  uploaded_at?: string;
}

interface LinkedDocument {
  id: number;
  business_process_id: number;
  business_document_id?: number;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  // For document-to-document linking
  related_document_id?: number;
  relatedDocument?: BusinessDocument;
  businessDocument?: BusinessDocument;
  createdBy: {
    id: number;
    username: string;
    email: string;
  } | null;
}

interface BusinessProcess {
  id: number;
  businessArea: string;
  subBusinessArea?: string;
  processName: string;
  documentName?: string;
  version?: string;
  progress?: string;
  docStatus?: string;
  statusPercentage?: number;
  priority?: string;
  targetDate?: string;
  processOwner?: string;
  updateDate?: string;
  remarks?: string;
  reviewDate?: string;
  linkedDocuments?: LinkedDocument[];
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function BusinessProcessDetailPage() {
  const router = useRouter();
  const [process, setProcess] = useState<BusinessProcess | null>(null);
  const [linkedDocuments, setLinkedDocuments] = useState<LinkedDocument[]>([]);
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

    const fetchProcess = async () => {
      try {
        const id = window.location.pathname.split('/').pop();
        
        if (!id) {
          throw new Error('No process ID provided');
        }

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

        const response = await fetch(`/api/business-processes/${id}`, {
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
              setError('You do not have permission to view this process. Please ensure you have access to the process\'s business area.');
            }
            return;
          } else if (response.status === 404) {
            if (isMounted) {
              setError('Process not found. It may have been deleted or you do not have access to it.');
            }
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            if (isMounted) {
              setError(errorData.error || 'Failed to fetch business process');
            }
            return;
          }
        }
        
        const data = await response.json();
        if (isMounted) {
          setProcess(data);
          setLinkedDocuments(data.linkedDocuments || []);
        }
      } catch (err) {
        // Only set error if component is still mounted and it's not a logout-related issue
        if (isMounted && err instanceof Error) {
          // Check if token still exists - if not, user is logging out
          const token = clientTokenUtils.getToken();
          if (token) {
            setError(err.message);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProcess();

    // Cleanup function to mark component as unmounted
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On-Track':
        return 'bg-blue-100 text-blue-800';
      case 'Minor Challenges':
        return 'bg-yellow-100 text-yellow-800';
      case 'Major Challenges':
        return 'bg-red-100 text-red-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In progress':
        return 'bg-blue-100 text-blue-800';
      case 'To be reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'New':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (process?.file_url) {
      const fileId = extractFileIdFromUrl(process.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(process.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (process?.file_url) {
      const fileId = extractFileIdFromUrl(process.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(process.file_url, '_blank');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!process) return;

    try {
      const response = await fetch('/api/business-processes/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: process.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete business process');
      }

      await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Business process successfully deleted'
      });
      
      // Redirect to the list page after successful deletion
      setTimeout(() => {
        router.push('/processes');
      }, 1500);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete business process'
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

  if (error || !process) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Business process not found'}</p>
        <Link
          href="/processes"
          className="mt-2 inline-block text-brand-primary hover:underline"
        >
          Back to Business Processes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/processes"
            className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Business Processes
          </Link>
        </div>
        <Link
          href={`/processes/${process.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Process
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiTrash2 size={16} />
          Delete Process
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Business Process Details</h1>
        <p className="text-brand-gray3 mt-1">View detailed information about this business process</p>
      </div>

      {/* Process Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Business Area
            </label>
            <p className="text-brand-white font-medium">{process.businessArea}</p>
          </div>

          {/* Sub Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Sub Business Area
            </label>
            <p className="text-brand-white">
              {process.subBusinessArea || 'Not specified'}
            </p>
          </div>

          {/* Process Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Process Name
            </label>
            <p className="text-brand-white font-medium">{process.processName}</p>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Name
            </label>
            <p className="text-brand-white">
              {process.documentName || 'Not specified'}
            </p>
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Version
            </label>
            <p className="text-brand-white">
              {process.version || 'Not specified'}
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Priority
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(process.priority || '')}`}>
              {process.priority || 'Not set'}
            </span>
          </div>

          {/* Status Percentage */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Status Percentage
            </label>
            <p className="text-brand-white font-medium">{process.statusPercentage || 0}%</p>
          </div>

          {/* Document Status */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Status
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(process.docStatus || '')}`}>
              {process.docStatus || 'Not set'}
            </span>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Progress
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(process.progress || '')}`}>
              {process.progress || 'Not set'}
            </span>
          </div>

          {/* Process Owner */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Process Owner
            </label>
            <p className="text-brand-white">
              {process.processOwner || 'Not specified'}
            </p>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Target Date
            </label>
            <p className="text-brand-white">
              {process.targetDate ? (() => {
                const date = new Date(process.targetDate);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>

          {/* Update Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Last Updated
            </label>
            <p className="text-brand-white">
              {process.updateDate ? (() => {
                const date = new Date(process.updateDate);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>

          {/* Review Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Review Date
            </label>
            <p className="text-brand-white">
              {process.reviewDate ? (() => {
                const date = new Date(process.reviewDate);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>
        </div>

        {/* Remarks */}
        {process.remarks && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Remarks
            </label>
            <div className="bg-brand-gray1 rounded-lg p-4">
              <p className="text-brand-white whitespace-pre-wrap">{process.remarks}</p>
            </div>
          </div>
        )}

        {/* Attached File */}
        {process.file_name && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Attached File
            </label>
            <div className="bg-brand-gray1 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-brand-white">
                    <FiFileText size={16} />
                    <span className="text-sm">{process.file_name}</span>
                  </div>
                  {process.file_size && (
                    <p className="text-xs text-brand-gray3 mt-1">
                      {(process.file_size / 1024 / 1024).toFixed(2)} MB
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

      {/* Document Linking Section */}
      <DocumentLinkingManager
        businessProcessId={process.id}
        businessArea={process.businessArea}
        linkedDocuments={linkedDocuments}
        onLinkedDocumentsChange={setLinkedDocuments}
        canEdit={true}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={process?.processName || `Process ${process?.id}` || ''}
        itemType="business process"
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