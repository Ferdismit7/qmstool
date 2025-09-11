'use client';

import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import DocumentLinkingModal from './DocumentLinkingModal';
import CategorizedDocumentsDisplay from './CategorizedDocumentsDisplay';


interface LinkedDocument {
  id: number;
  business_process_id: number;
  business_document_id: number;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  businessDocument: {
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

interface DocumentLinkingManagerProps {
  businessProcessId: number;
  businessArea?: string;
  linkedDocuments: LinkedDocument[];
  onLinkedDocumentsChange: (documents: LinkedDocument[]) => void;
  canEdit?: boolean;
  className?: string;
}

export default function DocumentLinkingManager({
  businessProcessId,
  businessArea,
  linkedDocuments,
  onLinkedDocumentsChange,
  canEdit = true,
  className = ""
}: DocumentLinkingManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleLinkDocuments = async (documentIds: number[]) => {
    try {
      setError(null);

      const response = await fetch(`/api/business-processes/${businessProcessId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: documentIds
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`${result.linkedCount} document(s) linked successfully`);
        
        // Refresh linked documents
        await fetchLinkedDocuments();
      } else {
        throw new Error(result.error || 'Failed to link documents');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err; // Re-throw to let the modal handle it
    }
  };

  const handleUnlinkDocument = async (documentId: number) => {
    try {
      const response = await fetch(`/api/business-processes/${businessProcessId}/documents?documentId=${documentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Document unlinked successfully');
        
        // Refresh linked documents
        await fetchLinkedDocuments();
      } else {
        setError(result.error || 'Failed to unlink document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error unlinking document:', err);
    }
  };

  const fetchLinkedDocuments = async () => {
    try {
      const response = await fetch(`/api/business-processes/${businessProcessId}/documents`);
      const result = await response.json();

      if (result.success) {
        onLinkedDocumentsChange(result.data);
      }
    } catch (err) {
      console.error('Error fetching linked documents:', err);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Add Documents Section */}
      {canEdit && (
        <div className="bg-brand-gray2/30 border border-brand-gray1 rounded-lg p-4">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            <FiPlus size={16} />
            Link Documents
          </button>
        </div>
      )}

      {/* Linked Documents Display */}
      <CategorizedDocumentsDisplay
        linkedDocuments={linkedDocuments}
        onUnlinkDocument={handleUnlinkDocument}
        canEdit={canEdit}
      />

      {/* Document Linking Modal */}
      <DocumentLinkingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLinkDocuments={handleLinkDocuments}
        businessArea={businessArea}
        excludeProcessId={businessProcessId}
        businessProcessName={`Business Process #${businessProcessId}`}
      />
    </div>
  );
}
