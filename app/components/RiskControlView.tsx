'use client';

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import RiskTimelineChart from './RiskTimelineChart';

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

interface RiskControlViewProps {
  control: RiskManagementControl;
  onClose: () => void;
}

const statusStyles = {
  'Open': 'bg-red-500 text-white',
  'Under Review': 'bg-orange-500 text-white',
  'Closed': 'bg-green-500 text-white',
} as const;

const progressStyles = {
  'Not Started': 'bg-gray-500 text-white',
  'On-Track': 'bg-blue-500 text-white',
  'Completed': 'bg-green-500 text-white',
  'Minor Challenges': 'bg-orange-500 text-white',
  'Major Challenges': 'bg-red-500 text-white',
} as const;

const effectivenessStyles = {
  'High': 'bg-green-500 text-white',
  'Medium': 'bg-orange-500 text-white',
  'Low': 'bg-red-500 text-white',
} as const;

export default function RiskControlView({ control, onClose }: RiskControlViewProps) {
  const getRiskLevel = (score: number) => {
    if (score <= 4) return { level: 'Low', color: 'text-green-400' };
    if (score <= 8) return { level: 'Medium', color: 'text-yellow-400' };
    if (score <= 15) return { level: 'High', color: 'text-orange-400' };
    return { level: 'Critical', color: 'text-red-400' };
  };

  const inherentRisk = getRiskLevel(control.inherent_risk_score);
  const residualRisk = getRiskLevel(control.residual_risk_overall_score);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-7xl max-h-[90vh] overflow-y-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{control.process_name}</h2>
          <p className="text-gray-400 text-lg">{control.business_area}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={24} />
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyles[control.status] || 'bg-gray-500 text-white'}`}>
            {control.status}
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Progress</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${progressStyles[control.doc_status] || 'bg-gray-500 text-white'}`}>
            {control.doc_status}
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Effectiveness</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${effectivenessStyles[control.control_effectiveness] || 'bg-gray-500 text-white'}`}>
            {control.control_effectiveness}
          </span>
        </div>
      </div>

      {/* Risk Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Inherent Risk Assessment</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Likelihood:</span>
              <span className="text-white font-semibold">{control.inherent_risk_likeliness}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Impact:</span>
              <span className="text-white font-semibold">{control.inherent_risk_impact}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Overall Score:</span>
              <span className={`text-2xl font-bold ${inherentRisk.color}`}>
                {control.inherent_risk_score} ({inherentRisk.level})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Residual Risk Assessment</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Likelihood:</span>
              <span className="text-white font-semibold">{control.residual_risk_likeliness}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Impact:</span>
              <span className="text-white font-semibold">{control.residual_risk_impact}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Overall Score:</span>
              <span className={`text-2xl font-bold ${residualRisk.color}`}>
                {control.residual_risk_overall_score} ({residualRisk.level})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid - Activity and Control side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Activity Details</h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Activity Description</span>
              <p className="text-white mt-1">{control.activity_description || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Issue Description</span>
              <p className="text-white mt-1">{control.issue_description}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Issue Type</span>
              <p className="text-white mt-1">{control.issue_type || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Control Information</h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Control Description</span>
              <p className="text-white mt-1">{control.control_description || 'Not specified'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-400 uppercase tracking-wide">Control Type</span>
                <p className="text-white mt-1">{control.control_type || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-400 uppercase tracking-wide">Control Owner</span>
                <p className="text-white mt-1">{control.control_owner || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Progress</span>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${control.control_progress}%` }}
                  ></div>
                </div>
                <span className="text-white font-semibold">{control.control_progress}%</span>
              </div>
            </div>
            {control.control_target_date && (
              <div>
                <span className="text-sm text-gray-400 uppercase tracking-wide">Target Date</span>
                <p className="text-white mt-1">{new Date(control.control_target_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Score Timeline - Full Width at Bottom */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Score Timeline</h3>
        <RiskTimelineChart 
          riskId={control.id} 
          processName={control.process_name} 
        />
      </div>
     </div>
   </div>
 );
} 