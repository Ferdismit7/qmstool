'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import { CenteredLoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import RiskTimelineChart from '@/app/components/RiskTimelineChart';

interface RiskManagementControl {
  id: number;
  process_name: string;
  activity_description: string;
  issue_description: string;
  issue_type: string;
  inherent_risk_likeliness: number;
  inherent_risk_impact: number;
  inherent_risk_score: number;
  control_description: string;
  control_type: 'Preventive' | 'Detective' | 'Corrective';
  control_owner: string;
  control_effectiveness: 'High' | 'Medium' | 'Low';
  residual_risk_likeliness: number;
  status: 'Open' | 'Under Review' | 'Closed';
  doc_status: 'Not Started' | 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges';
  created_at: string;
  updated_at: string;
  business_area: string;
  control_progress: number;
  control_target_date: string;
  residual_risk_impact: number;
  residual_risk_overall_score: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  deleted_at: string;
  deleted_by: number;
}

const statusStyles = {
  'Open': 'bg-red-100 text-red-800',
  'Under Review': 'bg-orange-100 text-orange-800',
  'Closed': 'bg-green-100 text-green-800',
} as const;

const progressStyles = {
  'Not Started': 'bg-gray-100 text-gray-800',
  'On-Track': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Minor Challenges': 'bg-yellow-100 text-yellow-800',
  'Major Challenges': 'bg-red-100 text-red-800',
} as const;

const effectivenessStyles = {
  'High': 'bg-green-100 text-green-800',
  'Medium': 'bg-orange-100 text-orange-800',
  'Low': 'bg-red-100 text-red-800',
} as const;

export default function RiskControlDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [control, setControl] = useState<RiskManagementControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchControl = async () => {
      try {
        const response = await fetch(`/api/risk-management/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch risk control');
        }
        const data = await response.json();
        setControl(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchControl();
    }
  }, [params.id]);

  const getRiskLevel = (score: number) => {
    if (score <= 4) return { level: 'Low', color: 'text-green-400' };
    if (score <= 8) return { level: 'Medium', color: 'text-yellow-400' };
    if (score <= 15) return { level: 'High', color: 'text-orange-400' };
    return { level: 'Critical', color: 'text-red-400' };
  };

  if (loading) {
    return <CenteredLoadingSpinner />;
  }

  if (error || !control) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="text-center text-red-500">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error || 'Risk control not found'}</p>
          <button
            onClick={() => router.push('/risk-management')}
            className="mt-4 px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            Back to Risk Management
          </button>
        </div>
      </div>
    );
  }

  const inherentRisk = getRiskLevel(control.inherent_risk_score);
  const residualRisk = getRiskLevel(control.residual_risk_overall_score);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/risk-management')}
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to risk management"
          >
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">{control.process_name}</h1>
            <p className="text-brand-gray3">Risk Control Details</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/risk-management/${control.id}/edit`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FaEdit size={16} />
          Edit Control
        </button>
      </div>

      {/* Risk Control Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Business Area</label>
                <p className="text-brand-white">{control.business_area}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Process Name</label>
                <p className="text-brand-white">{control.process_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Issue Type</label>
                <p className="text-brand-white">{control.issue_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Control Type</label>
                <p className="text-brand-white">{control.control_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Control Owner</label>
                <p className="text-brand-white">{control.control_owner || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Status & Progress
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[control.status] || 'bg-gray-100 text-gray-800'}`}>
                  {control.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Progress</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${progressStyles[control.doc_status] || 'bg-gray-100 text-gray-800'}`}>
                  {control.doc_status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Effectiveness</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${effectivenessStyles[control.control_effectiveness] || 'bg-gray-100 text-gray-800'}`}>
                  {control.control_effectiveness}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Control Progress</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${control.control_progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-brand-gray3">{control.control_progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Risk Assessment
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Inherent Risk Score</label>
                <p className={`text-xl font-bold ${inherentRisk.color}`}>
                  {control.inherent_risk_score} ({inherentRisk.level})
                </p>
                <p className="text-sm text-brand-gray3">
                  Likelihood: {control.inherent_risk_likeliness}/5 | Impact: {control.inherent_risk_impact}/5
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Residual Risk Score</label>
                <p className={`text-xl font-bold ${residualRisk.color}`}>
                  {control.residual_risk_overall_score} ({residualRisk.level})
                </p>
                <p className="text-sm text-brand-gray3">
                  Likelihood: {control.residual_risk_likeliness}/5 | Impact: {control.residual_risk_impact}/5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Control Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
          <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2 mb-4">
            Activity Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-gray3">Activity Description</label>
              <p className="text-brand-white mt-1">{control.activity_description || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-brand-gray3">Issue Description</label>
              <p className="text-brand-white mt-1">{control.issue_description}</p>
            </div>
          </div>
        </div>

        <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
          <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2 mb-4">
            Control Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-gray3">Control Description</label>
              <p className="text-brand-white mt-1">{control.control_description || 'Not specified'}</p>
            </div>
            {control.control_target_date && (
              <div>
                <label className="text-sm font-medium text-brand-gray3">Target Date</label>
                <p className="text-brand-white mt-1">
                  {new Date(control.control_target_date).toLocaleDateString('en-GB')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Score Timeline */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2 mb-4">
          Risk Score Timeline
        </h3>
        <div className="overflow-x-auto">
          <RiskTimelineChart 
            riskId={control.id} 
            processName={control.process_name} 
          />
        </div>
      </div>
    </div>
  );
}
