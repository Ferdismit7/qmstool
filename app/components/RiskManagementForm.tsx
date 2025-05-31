'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RiskManagementControl {
  id?: number;
  process_name: string;
  activity_description?: string;
  issue_description: string;
  issue_type?: string;
  likelihood?: number;
  impact?: number;
  risk_score?: number;
  control_description?: string;
  control_type?: 'Preventive' | 'Detective' | 'Corrective';
  control_owner?: string;
  control_effectiveness?: 'High' | 'Medium' | 'Low';
  residual_risk?: number;
  status?: 'Open' | 'Under Review' | 'Closed';
}

interface RiskManagementFormProps {
  control?: RiskManagementControl;
}

export default function RiskManagementForm({ control }: RiskManagementFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<RiskManagementControl>({
    process_name: '',
    activity_description: '',
    issue_description: '',
    issue_type: '',
    likelihood: 1,
    impact: 1,
    control_description: '',
    control_type: 'Preventive',
    control_owner: '',
    control_effectiveness: 'Medium',
    residual_risk: 1,
    status: 'Open',
    ...control
  });

  const [loading, setLoading] = useState(false);
  const [calculatedRiskScore, setCalculatedRiskScore] = useState<number | null>(null);

  useEffect(() => {
    if (formData.likelihood !== undefined && formData.likelihood !== null && 
        formData.impact !== undefined && formData.impact !== null) {
      setCalculatedRiskScore((formData.likelihood || 0) * (formData.impact || 0));
    } else {
      setCalculatedRiskScore(null);
    }
  }, [formData.likelihood, formData.impact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Remove risk_score from the data being sent
      const { risk_score, ...formDataToSubmit } = formData;

      const url = control ? `/api/risk-management/${control.id}` : '/api/risk-management';
      const method = control ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save risk management control');
      }

      router.push('/risk-management');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save risk management control');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'likelihood' || name === 'impact' || name === 'residual_risk' 
        ? Number(value) || null
        : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end space-x-4 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg border border-brand-gray3 text-brand-white hover:bg-brand-gray3 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : control ? 'Update' : 'Create'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Process Name *
          </label>
          <input
            type="text"
            name="process_name"
            value={formData.process_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Activity Description
          </label>
          <textarea
            name="activity_description"
            value={formData.activity_description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Issue Description *
          </label>
          <textarea
            name="issue_description"
            value={formData.issue_description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Issue Type
          </label>
          <input
            type="text"
            name="issue_type"
            value={formData.issue_type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Likelihood (1-5)
          </label>
          <input
            type="number"
            name="likelihood"
            value={formData.likelihood || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Impact (1-5)
          </label>
          <input
            type="number"
            name="impact"
            value={formData.impact || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Risk Score (Calculated)
          </label>
          <input
            type="number"
            value={calculatedRiskScore || ''}
            readOnly
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Control Description
          </label>
          <textarea
            name="control_description"
            value={formData.control_description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Control Type
          </label>
          <select
            name="control_type"
            value={formData.control_type || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Select Type</option>
            <option value="Preventive">Preventive</option>
            <option value="Detective">Detective</option>
            <option value="Corrective">Corrective</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Control Owner
          </label>
          <input
            type="text"
            name="control_owner"
            value={formData.control_owner}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Control Effectiveness
          </label>
          <select
            name="control_effectiveness"
            value={formData.control_effectiveness || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Select Effectiveness</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Residual Risk (1-5)
          </label>
          <input
            type="number"
            name="residual_risk"
            value={formData.residual_risk || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Select Status</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>
    </form>
  );
} 