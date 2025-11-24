'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import DocumentLinkingManager from '../../components/DocumentLinkingManager';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';
import { useRouter } from 'next/navigation';
import { clientTokenUtils } from '@/lib/auth';

interface BusinessDocument {
  id: number;
  business_area: string;
  sub_business_area?: string;
  document_name: string;
  name_and_numbering?: string;
  document_type?: string;
  version?: string;
  progress?: string;
  doc_status?: string;
  status_percentage?: number;
  priority?: string;
  target_date?: string;
  document_owner?: string;
  update_date?: string;
  remarks?: string;
  review_date?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
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
  relatedDocument?: {
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
  };
  businessDocument?: {
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
  };
  createdBy: {
    id: number;
    username: string;
    email: string;
  } | null;
}

export default function BusinessDocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [document, setDocument] = useState<BusinessDocument | null>(null);
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
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);
        
        // Get token for Authorization header (fallback if cookies don't work)
        // Try multiple times in case of timing issues with page load
        let token = clientTokenUtils.getToken();
        if (!token) {
          // Wait a bit and try again (token might be loading)
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
        const response = await fetch(`/api/business-documents/${id}`, {
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
              setError('You do not have permission to view this document. Please ensure you have access to the document\'s business area.');
            }
            return;
          } else if (response.status === 404) {
            if (isMounted) {
              setError('Document not found. It may have been deleted or you do not have access to it.');
            }
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            if (isMounted) {
              setError(errorData.error || 'Failed to fetch document');
            }
            return;
          }
        }
        
        const data = await response.json();
        if (isMounted) {
          setDocument(data);
          // Fetch related links
          try {
            const linksRes = await fetch(`/api/business-document-registry/${data.id}/links`, {
              credentials: 'include', // Include cookies for authentication
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const linksJson = await linksRes.json();
            if (linksJson.success && isMounted) {
              setLinkedDocuments(linksJson.data);
            }
          } catch (linkError) {
            console.error('Error fetching document links:', linkError);
            // Don't fail the whole page if links fail to load
          }
        }
      } catch (error) {
        // Only set error if component is still mounted and it's not a logout-related issue
        if (isMounted) {
          const token = clientTokenUtils.getToken();
          if (token) {
            console.error('Error fetching document:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch document');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDocument();

    // Cleanup function to mark component as unmounted
    return () => {
      isMounted = false;
    };
  }, [params]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW':
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
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
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'NOT_STARTED':
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'ON_HOLD':
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (document?.file_url) {
      const fileId = extractFileIdFromUrl(document.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(document.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (document?.file_url) {
      const fileId = extractFileIdFromUrl(document.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(document.file_url, '_blank');
      }
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

  const handleDeleteConfirm = async () => {
    if (!document) return;

    try {
      // Get token for Authorization header
      const token = clientTokenUtils.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/business-document-registry/soft-delete', {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ id: document.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete business document');
      }

      await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Business document successfully deleted'
      });
      
      // Redirect to the list page after successful deletion
      setTimeout(() => {
        router.push('/business-document-registry');
      }, 1500);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete business document'
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

  if (!document) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Document not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={fromParam ? decodeURIComponent(fromParam) : "/business-document-registry"}
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title={fromParam ? "Back to previous page" : "Back to documents"}
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">{document.document_name}</h1>
            <p className="text-brand-gray3 mt-1">
              {fromParam ? "Document Details (from Business Process)" : "Document Details"}
            </p>
          </div>
        </div>
        <Link
          href={`/business-document-registry/${document.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Document
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiTrash2 size={16} />
          Delete Document
        </button>
      </div>

      {/* Document Details */}
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
                <p className="text-brand-white">{document.business_area}</p>
                {document.sub_business_area && (
                  <p className="text-sm text-brand-gray3">{document.sub_business_area}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Document Name</label>
                <p className="text-brand-white">{document.document_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Document Type</label>
                <p className="text-brand-white">{document.document_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Name & Numbering</label>
                <p className="text-brand-white">{document.name_and_numbering || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Version</label>
                <p className="text-brand-white">{document.version || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Status & Progress
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.doc_status || '')}`}>
                    {document.doc_status || 'Not set'}
                  </span>
                  <span className="text-sm text-brand-gray3">
                    {document.status_percentage || 0}%
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Progress</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(document.progress || '')}`}>
                    {document.progress || 'Not set'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Priority</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(document.priority || '')}`}>
                    {document.priority || 'Not set'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Document Owner</label>
                <p className="text-brand-white">{document.document_owner || 'Not specified'}</p>
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
                  {document.target_date ? (() => {
                    const date = new Date(document.target_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Review Date</label>
                <p className="text-brand-white">
                  {document.review_date ? (() => {
                    const date = new Date(document.review_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Last Updated</label>
                <p className="text-brand-white">
                  {document.update_date ? (() => {
                    const date = new Date(document.update_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attached File */}
        {document.file_name && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Attached File
            </label>
            <div className="bg-brand-gray1 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-brand-white">
                    <FiFileText size={16} />
                    <span className="text-sm">{document.file_name}</span>
                  </div>
                  {document.file_size && (
                    <p className="text-xs text-brand-gray3 mt-1">
                      {(document.file_size / 1024 / 1024).toFixed(2)} MB
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

        {/* Remarks */}
        {document.remarks && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Remarks</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg">
              {document.remarks}
            </p>
          </div>
        )}
      </div>

      {/* Related Documents Linking */}
      {document && (
        <DocumentLinkingManager
          businessDocumentId={document.id}
          businessArea={document.business_area}
          linkedDocuments={linkedDocuments}
          onLinkedDocumentsChange={setLinkedDocuments}
          canEdit={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={document?.document_name || `Document ${document?.id}` || ''}
        itemType="business document"
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