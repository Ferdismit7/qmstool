'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import NonConformityForm from '../../components/NonConformityForm';

interface NonConformity {
  id?: number;
  business_area: string;
  sub_business_area: string;
  nc_number: string;
  nc_type: string;
  description: string;
  root_cause: string;
  corrective_action: string;
  responsible_person: string;
  target_date: string;
  completion_date: string;
  status: string;
  priority: string;
  impact_level: string;
  verification_method: string;
  effectiveness_review: string;
  lessons_learned: string;
  related_documents: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export default function NewNonConformity() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAddNonConformity = async (nonConformity: NonConformity) => {
    try {
      setError(null);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/non-conformities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(nonConformity),
      });

      if (!response.ok) {
        throw new Error('Failed to create non-conformity');
      }

      const newNonConformity = await response.json();
      
      // Redirect to the new non-conformity's detail page
      router.push(`/non-conformities/${newNonConformity.id}`);
    } catch (error) {
      console.error('Error creating non-conformity:', error);
      setError(error instanceof Error ? error.message : 'Failed to create non-conformity');
    }
  };

  const handleClose = () => {
    router.push('/non-conformities');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/non-conformities"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to non-conformities"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Add New Non-Conformity</h1>
            <p className="text-brand-gray3 mt-1">Create a new non-conformity record</p>
          </div>
        </div>
        <Link
          href="/non-conformities"
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

      {/* Non-Conformity Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <NonConformityForm
          onAdd={handleAddNonConformity}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
