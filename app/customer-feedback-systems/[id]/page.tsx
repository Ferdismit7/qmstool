'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';

interface CustomerFeedbackSystem {
  id: number;
  business_area: string;
  has_feedback_system: 'Yes' | 'No' | 'Planned';
  document_reference: string;
  last_review_date: string;
  status_percentage: number;
  doc_status: 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started';
  progress: 'To be reviewed' | 'Completed' | 'In progress' | 'New';
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerFeedbackSystemDetailPage() {
  const [feedbackSystem, setFeedbackSystem] = useState<CustomerFeedbackSystem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbackSystem = async () => {
      try {
        const id = window.location.pathname.split('/').pop();
        
        if (!id) {
          throw new Error('No feedback system ID provided');
        }

        const response = await fetch(`/api/customer-feedback-systems/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch feedback system');
        }
        
        const data = await response.json();
        setFeedbackSystem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbackSystem();
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

  const getFeedbackSystemColor = (system: string) => {
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

  if (error || !feedbackSystem) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Feedback system not found'}</p>
        <Link
          href="/customer-feedback-systems"
          className="mt-2 inline-block text-brand-primary hover:underline"
        >
          Back to Feedback Systems
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
            href="/customer-feedback-systems"
            className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Feedback Systems
          </Link>
        </div>
        <Link
          href={`/customer-feedback-systems/${feedbackSystem.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Feedback System
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Customer Feedback System Details</h1>
        <p className="text-brand-gray3 mt-1">View detailed information about this feedback system</p>
      </div>

      {/* Feedback System Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Business Area
            </label>
            <p className="text-brand-white font-medium">{feedbackSystem.business_area}</p>
          </div>

          {/* Has Feedback System */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Has Feedback System
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFeedbackSystemColor(feedbackSystem.has_feedback_system)}`}>
              {feedbackSystem.has_feedback_system}
            </span>
          </div>

          {/* Document Reference */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Reference
            </label>
            <p className="text-brand-white">
              {feedbackSystem.document_reference || 'Not specified'}
            </p>
          </div>

          {/* Last Review Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Last Review Date
            </label>
            <p className="text-brand-white">
              {feedbackSystem.last_review_date ? (() => {
                const date = new Date(feedbackSystem.last_review_date);
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
            <p className="text-brand-white font-medium">{feedbackSystem.status_percentage}%</p>
          </div>

          {/* Document Status */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Status
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedbackSystem.doc_status)}`}>
              {feedbackSystem.doc_status}
            </span>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Progress
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(feedbackSystem.progress)}`}>
              {feedbackSystem.progress}
            </span>
          </div>
        </div>

        {/* Notes */}
        {feedbackSystem.notes && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Notes
            </label>
            <div className="bg-brand-gray1 rounded-lg p-4">
              <p className="text-brand-white whitespace-pre-wrap">{feedbackSystem.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 