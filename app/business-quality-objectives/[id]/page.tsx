'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import MonthlyProgressTracker from '../../components/MonthlyProgressTracker';

interface BusinessQualityObjective {
  id: number;
  category: string;
  business_area: string;
  sub_business_area: string;
  qms_main_objectives: string;
  qms_objective_description: string;
  kpi_or_sla_targets: string;
  performance_monitoring: string;
  proof_of_measuring: string;
  proof_of_reporting: string;
  frequency: string;
  responsible_person_team: string;
  review_date: string;
  progress: string;
  status_percentage: number;
  doc_status: string;
}

export default function BusinessQualityObjectiveDetailPage() {
  const [objective, setObjective] = useState<BusinessQualityObjective | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObjective = async () => {
      try {
        const id = window.location.pathname.split('/').pop();
        
        if (!id) {
          throw new Error('No objective ID provided');
        }

        const response = await fetch(`/api/business-quality-objectives/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch business quality objective');
        }
        
        const data = await response.json();
        setObjective(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchObjective();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TO_BE_REVIEWED':
        return 'bg-yellow-100 text-yellow-800';
      case 'NEW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800';
      case 'MINOR_CHALLENGES':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAJOR_CHALLENGES':
        return 'bg-red-100 text-red-800';
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800';
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

  if (error || !objective) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Business quality objective not found'}</p>
        <Link
          href="/business-quality-objectives"
          className="mt-2 inline-block text-brand-primary hover:underline"
        >
          Back to Business Quality Objectives
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
            href="/business-quality-objectives"
            className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Business Quality Objectives
          </Link>
        </div>
        <Link
          href={`/business-quality-objectives/${objective.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Objective
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Business Quality Objective Details</h1>
        <p className="text-brand-gray3 mt-1">View detailed information about this quality objective</p>
      </div>

      {/* Objective Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Business Area
            </label>
            <p className="text-brand-white font-medium">{objective.business_area}</p>
          </div>

          {/* Sub Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Sub Business Area
            </label>
            <p className="text-brand-white">
              {objective.sub_business_area || 'Not specified'}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Category
            </label>
            <p className="text-brand-white font-medium">{objective.category}</p>
          </div>

          {/* Responsible Person/Team */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Responsible Person/Team
            </label>
            <p className="text-brand-white">
              {objective.responsible_person_team || 'Not specified'}
            </p>
          </div>

          {/* Status Percentage */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Status Percentage
            </label>
            <p className="text-brand-white font-medium">{objective.status_percentage || 0}%</p>
          </div>

          {/* Document Status */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Status
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(objective.doc_status || '')}`}>
              {objective.doc_status || 'Not set'}
            </span>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Progress
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(objective.progress || '')}`}>
              {objective.progress || 'Not set'}
            </span>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Frequency
            </label>
            <p className="text-brand-white">
              {objective.frequency || 'Not specified'}
            </p>
          </div>

          {/* Review Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Review Date
            </label>
            <p className="text-brand-white">
              {objective.review_date ? (() => {
                const date = new Date(objective.review_date);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>
        </div>

        {/* Main Objectives */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Main Objectives
          </label>
          <div className="bg-brand-gray1 rounded-lg p-4">
            <p className="text-brand-white whitespace-pre-wrap">{objective.qms_main_objectives || 'Not specified'}</p>
          </div>
        </div>

        {/* Objective Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Objective Description
          </label>
          <div className="bg-brand-gray1 rounded-lg p-4">
            <p className="text-brand-white whitespace-pre-wrap">{objective.qms_objective_description || 'Not specified'}</p>
          </div>
        </div>

        {/* KPI/SLA Targets */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            KPI/SLA Targets
          </label>
          <div className="bg-brand-gray1 rounded-lg p-4">
            <p className="text-brand-white whitespace-pre-wrap">{objective.kpi_or_sla_targets || 'Not specified'}</p>
          </div>
        </div>

        {/* Performance Monitoring */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Performance Monitoring
          </label>
          <div className="bg-brand-gray1 rounded-lg p-4">
            <p className="text-brand-white whitespace-pre-wrap">{objective.performance_monitoring || 'Not specified'}</p>
          </div>
        </div>

        {/* Proof of Measuring */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Proof of Measuring
          </label>
          <div className="bg-brand-gray1 rounded-lg p-4">
            <p className="text-brand-white whitespace-pre-wrap">{objective.proof_of_measuring || 'Not specified'}</p>
          </div>
        </div>

        {/* Proof of Reporting */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Proof of Reporting
          </label>
          <div className="bg-brand-gray1 rounded-lg p-4">
            <p className="text-brand-white whitespace-pre-wrap">{objective.proof_of_reporting || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Monthly Progress Tracking */}
      <MonthlyProgressTracker 
        objectiveId={objective.id} 
        objectiveName={objective.qms_main_objectives || `Objective ${objective.id}`}
      />
    </div>
  );
} 