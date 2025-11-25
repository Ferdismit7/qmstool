'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import BusinessDocumentForm from '../../../components/BusinessDocumentForm';
import { BusinessDocument } from '../../../types/businessDocument';

interface BusinessDocumentData {
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

export default function EditBusinessDocument({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [document, setDocument] = useState<BusinessDocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpdateDocument = async (updatedDocument: BusinessDocument) => {
    try {
      const { id } = await params;
      setError(null);

      // Authentication is handled automatically via cookies
      const response = await fetch(`/api/business-documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDocument),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      // Redirect to the document detail page
      router.push(`/business-document-registry/${id}`);
    } catch (error) {
      console.error('Error updating document:', error);
      setError(error instanceof Error ? error.message : 'Failed to update document');
    }
  };

  const handleClose = () => {
    if (document) {
      router.push(`/business-document-registry/${document.id}`);
    } else {
      router.push('/business-document-registry');
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
            href={`/business-document-registry/${document?.id || ''}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to document"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Edit Document</h1>
            <p className="text-brand-gray3 mt-1">{document.document_name}</p>
          </div>
        </div>
        <Link
          href={`/business-document-registry/${document?.id || ''}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiX size={12} />
          Cancel
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Business Document Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <BusinessDocumentForm
          onAdd={handleUpdateDocument}
          onClose={handleClose}
          editData={document as BusinessDocument}
        />
      </div>
    </div>
  );
} 