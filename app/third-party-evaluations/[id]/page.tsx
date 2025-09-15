'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';

interface ThirdPartyEvaluation {
  id: number;
  business_area: string;
  sub_business_area?: string;
  evaluation_type?: string;
  third_party_name?: string;
  evaluation_scope?: string;
  evaluation_criteria?: string;
  evaluation_method?: string;
  evaluation_date?: string;
  next_evaluation_date?: string;
  evaluator_name?: string;
  evaluator_credentials?: string;
  evaluation_findings?: string;
  strengths?: string;
  areas_for_improvement?: string;
  recommendations?: string;
  compliance_status?: string;
  risk_assessment?: string;
  corrective_actions?: string;
  follow_up_required?: string;
  overall_rating?: string;
  responsible_person?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function ThirdPartyEvaluationDetail({ params }: { params: Promise<{ id: string }> }) {
  const [evaluation, setEvaluation] = useState<ThirdPartyEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/third-party-evaluations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch third party evaluation');
        }
        
        const data = await response.json();
        if (data.success) {
          setEvaluation(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch third party evaluation');
        }
      } catch (error) {
        console.error('Error fetching third party evaluation:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch third party evaluation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [params]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLIANT':
      case 'SATISFACTORY':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_COMPLIANT':
      case 'NEEDS_IMPROVEMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'NON_COMPLIANT':
      case 'UNSATISFACTORY':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating?.toUpperCase()) {
      case 'EXCELLENT':
      case '5':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'GOOD':
      case '4':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'FAIR':
      case '3':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'POOR':
      case '2':
      case '1':
      case 'D':
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (evaluation?.file_url) {
      const fileId = extractFileIdFromUrl(evaluation.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(evaluation.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (evaluation?.file_url) {
      const fileId = extractFileIdFromUrl(evaluation.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(evaluation.file_url, '_blank');
      }
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

  if (!evaluation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Third party evaluation not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/third-party-evaluations"
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to third party evaluations"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Third Party Evaluation Details</h1>
            <p className="text-brand-gray3 mt-1">{evaluation.third_party_name || `Evaluation ${evaluation.id}`}</p>
          </div>
        </div>
        <Link
          href={`/third-party-evaluations/${evaluation.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Evaluation
        </Link>
      </div>

      {/* Evaluation Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Business Area</label>
                <p className="text-brand-white">{evaluation.business_area}</p>
                {evaluation.sub_business_area && (
                  <p className="text-sm text-brand-gray3">{evaluation.sub_business_area}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Third Party Name</label>
                <p className="text-brand-white">{evaluation.third_party_name || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Evaluation Type</label>
                <p className="text-brand-white">{evaluation.evaluation_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Responsible Person</label>
                <p className="text-brand-white">{evaluation.responsible_person || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Status & Rating */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Status & Rating
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Compliance Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.compliance_status || '')}`}>
                  {evaluation.compliance_status || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Overall Rating</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(evaluation.overall_rating || '')}`}>
                  {evaluation.overall_rating || 'Not rated'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Evaluator</label>
                <p className="text-brand-white">{evaluation.evaluator_name || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Dates & File Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Dates & Files
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Evaluation Date</label>
                <p className="text-brand-white">
                  {evaluation.evaluation_date ? (() => {
                    const date = new Date(evaluation.evaluation_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Next Evaluation</label>
                <p className="text-brand-white">
                  {evaluation.next_evaluation_date ? (() => {
                    const date = new Date(evaluation.next_evaluation_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not scheduled'}
                </p>
              </div>
              {evaluation.file_name && (
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Attached File</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-brand-white">
                        <FiFileText size={16} />
                        <span className="text-sm">{evaluation.file_name}</span>
                      </div>
                      {evaluation.file_size && (
                        <p className="text-xs text-brand-gray3 mt-1">
                          {(evaluation.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleView}
                        className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                        title="View document"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                        title="Download document"
                      >
                        <FiDownload size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Scope & Method */}
        <div className="mt-6 pt-6 border-t border-brand-gray1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-white mb-3">Evaluation Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Evaluation Scope</label>
                  <p className="text-brand-white bg-brand-gray1/30 p-3 rounded-lg whitespace-pre-wrap">
                    {evaluation.evaluation_scope || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Evaluation Criteria</label>
                  <p className="text-brand-white bg-brand-gray1/30 p-3 rounded-lg whitespace-pre-wrap">
                    {evaluation.evaluation_criteria || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Evaluation Method</label>
                  <p className="text-brand-white bg-brand-gray1/30 p-3 rounded-lg whitespace-pre-wrap">
                    {evaluation.evaluation_method || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-white mb-3">Evaluator Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Evaluator Credentials</label>
                  <p className="text-brand-white bg-brand-gray1/30 p-3 rounded-lg whitespace-pre-wrap">
                    {evaluation.evaluator_credentials || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-gray3">Risk Assessment</label>
                  <p className="text-brand-white bg-brand-gray1/30 p-3 rounded-lg whitespace-pre-wrap">
                    {evaluation.risk_assessment || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Findings */}
        {evaluation.evaluation_findings && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Evaluation Findings</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {evaluation.evaluation_findings}
            </p>
          </div>
        )}

        {/* Strengths & Areas for Improvement */}
        <div className="mt-6 pt-6 border-t border-brand-gray1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluation.strengths && (
              <div>
                <h3 className="text-lg font-semibold text-brand-white mb-3">Strengths</h3>
                <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
                  {evaluation.strengths}
                </p>
              </div>
            )}
            {evaluation.areas_for_improvement && (
              <div>
                <h3 className="text-lg font-semibold text-brand-white mb-3">Areas for Improvement</h3>
                <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
                  {evaluation.areas_for_improvement}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations & Actions */}
        <div className="mt-6 pt-6 border-t border-brand-gray1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluation.recommendations && (
              <div>
                <h3 className="text-lg font-semibold text-brand-white mb-3">Recommendations</h3>
                <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
                  {evaluation.recommendations}
                </p>
              </div>
            )}
            {evaluation.corrective_actions && (
              <div>
                <h3 className="text-lg font-semibold text-brand-white mb-3">Corrective Actions</h3>
                <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
                  {evaluation.corrective_actions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up */}
        {evaluation.follow_up_required && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Follow-up Required</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {evaluation.follow_up_required}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}