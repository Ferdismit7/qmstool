'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';

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

export default function BusinessDocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const [document, setDocument] = useState<BusinessDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/business-documents/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch document');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
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
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(document.progress || '')}`}>
                  {document.progress || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(document.priority || '')}`}>
                  {document.priority || 'Not set'}
                </span>
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
    </div>
  );
} 