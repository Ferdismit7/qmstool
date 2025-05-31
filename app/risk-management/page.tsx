'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RiskManagementTable from '@/app/components/RiskManagementTable';

interface RiskManagementControl {
  id: number;
  process_name: string;
  activity_description: string;
  issue_description: string;
  issue_type: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  control_description: string;
  control_type: 'Preventive' | 'Detective' | 'Corrective';
  control_owner: string;
  control_effectiveness: 'High' | 'Medium' | 'Low';
  residual_risk: number;
  status: 'Open' | 'Under Review' | 'Closed';
  created_at: string;
  updated_at: string;
}

export default function RiskManagementPage() {
  const router = useRouter();
  const [controls, setControls] = useState<RiskManagementControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchControls = async () => {
    try {
      const response = await fetch('/api/risk-management');
      if (!response.ok) throw new Error('Failed to fetch controls');
      const data = await response.json();
      setControls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const handleEdit = (control: RiskManagementControl) => {
    router.push(`/risk-management/${control.id}/edit`);
  };

  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="w-full px-2 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-white mb-2">Risk Management</h1>
          <p className="text-brand-gray2">Manage your risk assessment and control matrix</p>
        </div>
        <Link
          href="/risk-management/new"
          className="px-6 py-2 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors"
        >
          Add New Risk Control
        </Link>
      </div>

      <RiskManagementTable
        controls={controls}
        loading={loading}
        onEdit={handleEdit}
        refresh={fetchControls}
      />
    </div>
  );
} 