'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import BusinessDocumentForm from '../../components/BusinessDocumentForm';
import { BusinessDocument } from '../../types/businessDocument';

export default function NewDocument() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAddDocument = async (document: BusinessDocument) => {
    try {
      setError(null);

      // Get token from multiple sources to ensure compatibility
      const token = sessionStorage.getItem('authToken') || 
                   localStorage.getItem('authToken') ||
                   (typeof window !== 'undefined' ? window.document.cookie.split('; ').find((row: string) => row.startsWith('authToken='))?.split('=')[1] : null) ||
                   (typeof window !== 'undefined' ? window.document.cookie.split('; ').find((row: string) => row.startsWith('clientAuthToken='))?.split('=')[1] : null);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/business-documents', {
        method: 'POST',
        headers,
        body: JSON.stringify(document),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDocument = await response.json();
      
      // Redirect to the new document's detail page
      router.push(`/documents/${newDocument.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      setError(error instanceof Error ? error.message : 'Failed to create document');
    }
  };

  const handleClose = () => {
    router.push('/documents');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/documents"
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
          href="/documents"
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