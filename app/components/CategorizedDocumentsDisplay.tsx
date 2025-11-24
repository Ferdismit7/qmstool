'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiFileText, FiTrash2, FiEye, FiDownload, FiUser, FiCalendar, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';

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

interface CategorizedDocumentsDisplayProps {
  linkedDocuments: LinkedDocument[];
  onUnlinkDocument: (documentId: number) => void;
  canEdit?: boolean;
  className?: string;
}

export default function CategorizedDocumentsDisplay({
  linkedDocuments,
  onUnlinkDocument,
  canEdit = true,
  className = ""
}: CategorizedDocumentsDisplayProps) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [unlinkingDocument, setUnlinkingDocument] = useState<number | null>(null);

  // Group documents by type
  const categorizedDocuments = linkedDocuments.reduce((acc, link) => {
    // Safety check for businessDocument
    if (!link.businessDocument) {
      console.warn('Linked document missing businessDocument:', link);
      return acc;
    }
    const type = link.businessDocument!.document_type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(link);
    return acc;
  }, {} as Record<string, LinkedDocument[]>);

  const handleToggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleUnlinkDocument = async (documentId: number) => {
    try {
      setUnlinkingDocument(documentId);
      await onUnlinkDocument(documentId);
    } catch (error) {
      console.error('Error unlinking document:', error);
    } finally {
      setUnlinkingDocument(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'policy':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'template':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'form':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'procedure':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'guideline':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Extract file ID from URL
    const fileId = extractFileIdFromUrl(fileUrl);
    if (fileId) {
      window.open(`/api/files/${fileId}/download`, '_blank');
    } else {
      // Fallback to direct URL
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (linkedDocuments.length === 0) {
    return (
      <div className={`bg-brand-gray2/50 border border-brand-gray1 rounded-lg p-6 text-center ${className}`}>
        <FiFileText size={48} className="mx-auto text-brand-gray3 mb-3" />
        <h3 className="text-lg font-medium text-brand-white mb-2">No Documents Linked</h3>
        <p className="text-brand-gray3">
          No linked documents yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-white">
          Linked Documents ({linkedDocuments.length})
        </h3>
      </div>

      <div className="space-y-3">
        {Object.entries(categorizedDocuments).map(([category, documents]) => {
          const isExpanded = expandedCategories.has(category);
          return (
            <div
              key={category}
              className="bg-brand-gray2/30 border border-brand-gray1 rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => handleToggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-brand-gray1/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <FiChevronDown size={20} className="text-brand-gray3" />
                  ) : (
                    <FiChevronRight size={20} className="text-brand-gray3" />
                  )}
                  <div className="flex items-center gap-3">
                    <FiFileText size={20} className="text-brand-primary" />
                    <div className="text-left">
                      <h4 className="text-base font-semibold text-brand-white">
                        {category}
                      </h4>
                      <p className="text-sm text-brand-gray3">
                        {documents.length} document{documents.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDocumentTypeColor(category)}`}>
                  {category}
                </span>
              </button>

              {/* Documents List */}
              {isExpanded && (
                <div className="border-t border-brand-gray1">
                  <div className="p-4 space-y-3">
                    {documents.map((link) => {
                      // Safety check for businessDocument
                      if (!link.businessDocument) {
                        console.warn('Linked document missing businessDocument:', link);
                        return null;
                      }
                      
                      return (
                      <div
                        key={link.id}
                        className="bg-brand-gray1/50 border border-brand-gray1/50 rounded-lg p-4 hover:border-brand-primary/30 transition-colors cursor-pointer"
                        onClick={() => {
                          const currentUrl = window.location.pathname;
                          const referrer = encodeURIComponent(currentUrl);
                          router.push(`/business-document-registry/${link.businessDocument!.id}?from=${referrer}`);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Document Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <FiFileText size={16} className="text-brand-primary flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-semibold text-brand-white truncate">
                                  {link.businessDocument!.document_name}
                                </h5>
                                <div className="flex items-center gap-2 text-xs text-brand-gray3">
                                  <span>v{link.businessDocument!.version}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status and Progress */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(link.businessDocument!.doc_status)}`}>
                                {link.businessDocument!.doc_status}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(link.businessDocument!.progress)}`}>
                                {link.businessDocument!.progress}
                              </span>
                              <span className="text-xs text-brand-gray3">
                                {link.businessDocument!.status_percentage}% complete
                              </span>
                            </div>

                            {/* File Information */}
                            {link.businessDocument!.file_url && (
                              <div className="flex items-center gap-2 text-sm text-brand-gray3 mb-3">
                                <span>File: {link.businessDocument!.file_name || 'Download'}</span>
                                {link.businessDocument!.file_type && (
                                  <span className="px-2 py-1 bg-brand-gray2 rounded text-xs">
                                    {link.businessDocument!.file_type}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Link Information */}
                            <div className="flex items-center gap-4 text-xs text-brand-gray3">
                              {link.createdBy && (
                                <div className="flex items-center gap-1">
                                  <FiUser size={12} />
                                  <span>Linked by {link.createdBy.username}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <FiCalendar size={12} />
                                <span>Linked on {formatDate(link.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                            {/* View Document */}
                            <button
                              onClick={() => {
                                const currentUrl = window.location.pathname;
                                const referrer = encodeURIComponent(currentUrl);
                                router.push(`/business-document-registry/${link.businessDocument!.id}?from=${referrer}`);
                              }}
                              className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                              title="View document details"
                            >
                              <FiEye size={16} />
                            </button>

                            {/* Download File */}
                            {link.businessDocument!.file_url && (
                              <button
                                onClick={() => handleDownload(link.businessDocument!.file_url!, link.businessDocument!.file_name || 'document')}
                                className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                                title="Download file"
                              >
                                <FiDownload size={16} />
                              </button>
                            )}

                            {/* Unlink Document */}
                            {canEdit && (
                              <button
                                onClick={() => handleUnlinkDocument(link.businessDocument!.id)}
                                disabled={unlinkingDocument === link.businessDocument!.id}
                                className="p-2 text-brand-gray3 hover:text-red-400 transition-colors disabled:opacity-50"
                                title="Unlink document"
                              >
                                {unlinkingDocument === link.businessDocument!.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                ) : (
                                  <FiTrash2 size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
