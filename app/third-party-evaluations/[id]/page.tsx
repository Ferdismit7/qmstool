'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';

interface ThirdPartyEvaluation {
  id: number;
  supplier_name: string;
  business_area: string;
  evaluation_system_in_place: 'Yes' | 'No' | 'Planned';
  document_reference: string;
  last_evaluation_date: string;
  status_percentage: number;
  doc_status: 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started';
  progress: 'To be reviewed' | 'Completed' | 'In progress' | 'New';
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function ThirdPartyEvaluationDetailPage() {
  const [evaluation, setEvaluation] = useState<ThirdPartyEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const id = window.location.pathname.split('/').pop();
        
        if (!id) {
          throw new Error('No evaluation ID provided');
        }

        const response = await fetch(`/api/third-party-evaluations/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch evaluation');
        }
        
        const data = await response.json();
        setEvaluation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On-Track':
        return 'bg-blue-100 text-blue-800';
      case 'Minor Challenges':
        return 'bg-yellow-100 text-yellow-800';
      case 'Major Challenges':
        return 'bg-red-100 text-red-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In progress':
        return 'bg-blue-100 text-blue-800';
      case 'To be reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'New':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEvaluationSystemColor = (system: string) => {
    switch (system) {
      case 'Yes':
        return 'bg-green-100 text-green-800';
      case 'No':
        return 'bg-red-100 text-red-800';
      case 'Planned':
        return 'bg-yellow-100 text-yellow-800';
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

  if (error || !evaluation) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Evaluation not found'}</p>
        <Link
          href="/third-party-evaluations"
          className="mt-2 inline-block text-brand-primary hover:underline"
        >
          Back to Third-Party Evaluations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/third-party-evaluations"
            className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Third-Party Evaluations
          </Link>
        </div>
        <Link
          href={`/third-party-evaluations/${evaluation.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Evaluation
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Third-Party Evaluation Details</h1>
        <p className="text-brand-gray3 mt-1">View detailed information about this evaluation</p>
      </div>

      {/* Evaluation Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Supplier Name
            </label>
            <p className="text-brand-white font-medium">{evaluation.supplier_name}</p>
          </div>

          {/* Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Business Area
            </label>
            <p className="text-brand-white font-medium">{evaluation.business_area}</p>
          </div>

          {/* Evaluation System in Place */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Evaluation System in Place
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEvaluationSystemColor(evaluation.evaluation_system_in_place)}`}>
              {evaluation.evaluation_system_in_place}
            </span>
          </div>

          {/* Document Reference */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Reference
            </label>
            <p className="text-brand-white">
              {evaluation.document_reference || 'Not specified'}
            </p>
          </div>

          {/* Last Evaluation Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Last Evaluation Date
            </label>
            <p className="text-brand-white">
              {evaluation.last_evaluation_date ? (() => {
                const date = new Date(evaluation.last_evaluation_date);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>

          {/* Status Percentage */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Status Percentage
            </label>
            <p className="text-brand-white font-medium">{evaluation.status_percentage}%</p>
          </div>

          {/* Document Status */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Status
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.doc_status)}`}>
              {evaluation.doc_status}
            </span>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Progress
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(evaluation.progress)}`}>
              {evaluation.progress}
            </span>
          </div>
        </div>

        {/* Notes */}
        {evaluation.notes && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Notes
            </label>
            <div className="bg-brand-gray1 rounded-lg p-4">
              <p className="text-brand-white whitespace-pre-wrap">{evaluation.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 