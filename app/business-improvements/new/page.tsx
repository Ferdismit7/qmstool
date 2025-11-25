'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import BusinessImprovementForm from '../../components/BusinessImprovementForm';

interface BusinessImprovement {
  id?: number;
  business_area: string;
  sub_business_area: string;
  improvement_title: string;
  improvement_type: string;
  description: string;
  business_case: string;
  expected_benefits: string;
  implementation_plan: string;
  success_criteria: string;
  responsible_person: string;
  start_date: string;
  target_completion_date: string;
  actual_completion_date: string;
  status: string;
  priority: string;
  budget_allocated: number;
  actual_cost: number;
  roi_calculation: string;
  lessons_learned: string;
  next_steps: string;
  related_processes: string;
  status_percentage: number;
  doc_status: string;
  progress: string;
  notes: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export default function NewBusinessImprovement() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAddBusinessImprovement = async (businessImprovement: BusinessImprovement) => {
    try {
      setError(null);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/business-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(businessImprovement),
      });

      if (!response.ok) {
        throw new Error('Failed to create business improvement');
      }

      const newBusinessImprovement = await response.json();
      
      // Redirect to the new business improvement's detail page
      router.push(`/business-improvements/${newBusinessImprovement.id}`);
    } catch (error) {
      console.error('Error creating business improvement:', error);
      setError(error instanceof Error ? error.message : 'Failed to create business improvement');
    }
  };

  const handleClose = () => {
    router.push('/business-improvements');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/business-improvements"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to business improvements"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Add New Business Improvement</h1>
            <p className="text-brand-gray3 mt-1">Create a new business improvement</p>
          </div>
        </div>
        <Link
          href="/business-improvements"
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

      {/* Business Improvement Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <BusinessImprovementForm
          onAdd={handleAddBusinessImprovement}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
