'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

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

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<BusinessDocument | null>(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/business-documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

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

  const handleDeleteClick = (document: BusinessDocument) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      const response = await fetch(`/api/business-documents?id=${documentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      await fetchDocuments();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete document'
      });
    } finally {
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };


  const handleViewDocument = (documentId: number) => {
    router.push(`/documents/${documentId}`);
  };

  const handleEditDocument = (documentId: number) => {
    router.push(`/documents/${documentId}/edit`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-white">Business Document Registry</h1>
          <p className="text-brand-gray3 mt-1">Manage and track all business documents</p>
        </div>
        <Link
          href="/documents/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Document
        </Link>
      </div>

      {/* Business Documents Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div className="overflow-x-auto min-w-full flex-1" style={{ overflowY: 'auto' }}>
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-brand-gray1">
              <thead className="bg-brand-gray1 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Business Area
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Target Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray1">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-brand-gray3">
                      No business documents found. Create your first document to get started.
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr 
                      key={document.id} 
                      className="hover:bg-brand-gray1/30 cursor-pointer"
                      onClick={() => router.push(`/documents/${document.id}`)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div>
                          <div className="text-sm font-medium text-brand-white">
                            {document.business_area}
                          </div>
                          {document.sub_business_area && (
                            <div className="text-xs text-brand-gray3 mt-1">
                              {document.sub_business_area}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-sm font-medium text-brand-white">
                          {document.document_name}
                        </div>
                        {document.version && (
                          <div className="text-xs text-brand-gray3 mt-1">
                            v{document.version}
                          </div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 align-top">
                        <div className="text-sm text-brand-white">
                          {document.document_type || 'Not specified'}
                        </div>
                        {document.name_and_numbering && (
                          <div className="text-xs text-brand-gray3 mt-1">
                            {document.name_and_numbering}
                          </div>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(document.priority || '')}`}>
                          {document.priority || 'Not set'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top w-32">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(document.doc_status || '')}`}>
                            {document.doc_status || 'Not set'}
                          </span>
                          <div className="text-xs text-brand-gray3 mt-1">
                            {document.status_percentage || 0}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(document.progress || '')}`}>
                          {document.progress || 'Not set'}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-brand-white align-top">
                        {document.target_date ? (() => {
                          const date = new Date(document.target_date);
                          // Adjust for timezone offset
                          const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                          const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                          return adjustedDate.toLocaleDateString('en-GB');
                        })() : 'Not set'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={documentToDelete?.document_name || ''}
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