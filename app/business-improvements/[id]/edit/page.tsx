'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import BusinessImprovementForm from '../../../components/BusinessImprovementForm';

interface BusinessImprovementData {
  id: number;
  business_area: string;
  sub_business_area?: string;
  improvement_title?: string;
  improvement_type?: string;
  description?: string;
  business_case?: string;
  expected_benefits?: string;
  implementation_plan?: string;
  success_criteria?: string;
  responsible_person?: string;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  status?: string;
  priority?: string;
  budget_allocated?: number;
  actual_cost?: number;
  roi_calculation?: string;
  lessons_learned?: string;
  next_steps?: string;
  related_processes?: string;
  status_percentage?: number;
  doc_status?: string;
  progress?: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function EditBusinessImprovement({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [businessImprovement, setBusinessImprovement] = useState<BusinessImprovementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessImprovement = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/business-improvements/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch business improvement');
        }
        
        const data = await response.json();
        if (data.success) {
          setBusinessImprovement(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch business improvement');
        }
      } catch (error) {
        console.error('Error fetching business improvement:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch business improvement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessImprovement();
  }, [params]);

  const handleUpdateBusinessImprovement = async (updatedBusinessImprovement: BusinessImprovementData) => {
    try {
      const { id } = await params;
      setError(null);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/business-improvements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBusinessImprovement),
      });

      if (!response.ok) {
        throw new Error('Failed to update business improvement');
      }

      // Redirect to the business improvement detail page
      router.push(`/business-improvements/${id}`);
    } catch (error) {
      console.error('Error updating business improvement:', error);
      setError(error instanceof Error ? error.message : 'Failed to update business improvement');
    }
  };

  const handleClose = () => {
    if (businessImprovement) {
      router.push(`/business-improvements/${businessImprovement.id}`);
    } else {
      router.push('/business-improvements');
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

  if (!businessImprovement) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Business improvement not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/business-improvements/${businessImprovement?.id || ''}`}
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to business improvement"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Edit Business Improvement</h1>
            <p className="text-brand-gray3 mt-1">{businessImprovement.improvement_title || 'Business Improvement'}</p>
          </div>
        </div>
        <Link
          href={`/business-improvements/${businessImprovement?.id || ''}`}
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

      {/* Business Improvement Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <BusinessImprovementForm
          onAdd={handleUpdateBusinessImprovement}
          onClose={handleClose}
          editData={businessImprovement}
        />
      </div>
    </div>
  );
}
