'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import NonConformityForm from '../../../components/NonConformityForm';

interface NonConformityData {
  id: number;
  business_area: string;
  sub_business_area?: string;
  nc_number?: string;
  nc_type?: string;
  description?: string;
  root_cause?: string;
  corrective_action?: string;
  responsible_person?: string;
  target_date?: string;
  completion_date?: string;
  status?: string;
  priority?: string;
  impact_level?: string;
  verification_method?: string;
  effectiveness_review?: string;
  lessons_learned?: string;
  related_documents?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function EditNonConformity({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [nonConformity, setNonConformity] = useState<NonConformityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNonConformity = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/non-conformities/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch non-conformity');
        }
        
        const data = await response.json();
        if (data.success) {
          setNonConformity(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch non-conformity');
        }
      } catch (error) {
        console.error('Error fetching non-conformity:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch non-conformity');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNonConformity();
  }, [params]);

  const handleUpdateNonConformity = async (updatedNonConformity: NonConformityData) => {
    try {
      const { id } = await params;
      setError(null);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/non-conformities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedNonConformity),
      });

      if (!response.ok) {
        throw new Error('Failed to update non-conformity');
      }

      // Redirect to the non-conformity detail page
      router.push(`/non-conformities/${id}`);
    } catch (error) {
      console.error('Error updating non-conformity:', error);
      setError(error instanceof Error ? error.message : 'Failed to update non-conformity');
    }
  };

  const handleClose = () => {
    if (nonConformity) {
      router.push(`/non-conformities/${nonConformity.id}`);
    } else {
      router.push('/non-conformities');
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

  if (!nonConformity) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Non-conformity not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/non-conformities/${nonConformity?.id || ''}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to non-conformity"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Edit Non-Conformity</h1>
            <p className="text-brand-gray3 mt-1">{nonConformity.nc_number || 'Non-Conformity'}</p>
          </div>
        </div>
        <Link
          href={`/non-conformities/${nonConformity?.id || ''}`}
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
          onAdd={handleUpdateNonConformity}
          onClose={handleClose}
          editData={nonConformity}
        />
      </div>
    </div>
  );
}
