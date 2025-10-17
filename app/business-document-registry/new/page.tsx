'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import BusinessDocumentForm from '../../components/BusinessDocumentForm';
import { BusinessDocument } from '../../types/businessDocument';

export default function NewBusinessDocument() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAddDocument = async (document: BusinessDocument) => {
    try {
      setError(null);

      // Authentication is handled automatically via cookies
      const response = await fetch('/api/business-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDocument = await response.json();
      
      // Redirect to the new document's detail page
      router.push(`/business-document-registry/${newDocument.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      setError(error instanceof Error ? error.message : 'Failed to create document');
    }
  };

  const handleClose = () => {
    router.push('/business-document-registry');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/business-document-registry"
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to documents"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Add New Document</h1>
            <p className="text-brand-gray3 mt-1">Create a new business document</p>
          </div>
        </div>
        <Link
          href="/business-document-registry"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gray1 text-brand-white rounded-lg hover:bg-brand-gray1/80 transition-colors"
        >
          <FiX size={16} />
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
          onAdd={handleAddDocument}
          onClose={handleClose}
        />
      </div>
    </div>
  );
} 