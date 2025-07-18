'use client';

import React, { useEffect, useState } from 'react';
import RiskManagementForm from '@/app/components/RiskManagementForm';
import { FullScreenLoadingSpinner } from '@/app/components/ui/LoadingSpinner';

interface RiskManagementControl {
  id: number;
  business_area: string;
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
  control_progress: number;
  control_target_date: string;
  residual_risk_impact: number;
  residual_risk_overall_score: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export default function EditRiskManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const [control, setControl] = useState<RiskManagementControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchControl = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/risk-management/${id}`);
        if (!response.ok) throw new Error('Failed to fetch risk management control');
        const data = await response.json();
        setControl(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchControl();
  }, [params]);

  if (loading) return <FullScreenLoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!control) return <div className="text-center py-4">Control not found</div>;

  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">Edit Risk Control</h1>
        <p className="text-brand-gray2">Update the risk assessment and control matrix entry</p>
      </div>

      <RiskManagementForm control={control} />
    </div>
  );
} 