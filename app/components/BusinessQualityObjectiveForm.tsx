'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BusinessQualityObjective {
  id?: number;
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
}

interface Props {
  objective?: BusinessQualityObjective;
  mode: 'create' | 'edit';
}

export default function BusinessQualityObjectiveForm({ objective, mode }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<BusinessQualityObjective>({
    category: '',
    business_area: '',
    sub_business_area: '',
    qms_main_objectives: '',
    qms_objective_description: '',
    kpi_or_sla_targets: '',
    performance_monitoring: '',
    proof_of_measuring: '',
    proof_of_reporting: '',
    frequency: '',
    responsible_person_team: '',
    review_date: '',
    progress: '',
    status_percentage: 0,
    ...objective
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (objective) {
      // Format the review_date to YYYY-MM-DD for the input field, preserving the local date
      const formattedObjective = {
        ...objective,
        review_date: objective.review_date ? new Date(objective.review_date).toLocaleDateString('en-CA') : ''
      };
      setFormData(formattedObjective);
    }
  }, [objective]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = mode === 'create' 
        ? '/api/business-quality-objectives'
        : `/api/business-quality-objectives/${objective?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save objective');
      }

      router.push('/business-quality-objectives');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
      [name]: name === 'status_percentage' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg bg-brand-gray1 text-brand-white hover:bg-brand-gray2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-brand-primary text-brand-white hover:bg-brand-primary/80 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Objective' : 'Update Objective'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Select Category</option>
            <option value="Client Experience">Client Experience</option>
            <option value="Performance Efficiencies – Business Process">Performance Efficiencies – Business Process</option>
            <option value="Performance Efficiencies – Documents">Performance Efficiencies – Documents</option>
            <option value="Employee Experience">Employee Experience</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Business Area
          </label>
          <input
            type="text"
            name="business_area"
            value={formData.business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Sub Business Area
          </label>
          <input
            type="text"
            name="sub_business_area"
            value={formData.sub_business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            QMS Main Objectives
          </label>
          <textarea
            name="qms_main_objectives"
            value={formData.qms_main_objectives}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            QMS Objective Description
          </label>
          <textarea
            name="qms_objective_description"
            value={formData.qms_objective_description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            KPI/SLA Targets
          </label>
          <textarea
            name="kpi_or_sla_targets"
            value={formData.kpi_or_sla_targets}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Performance Monitoring
          </label>
          <input
            type="text"
            name="performance_monitoring"
            value={formData.performance_monitoring}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Proof of Measuring
          </label>
          <select
            name="proof_of_measuring"
            value={formData.proof_of_measuring}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Select Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="In progress">In progress</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Proof of Reporting
          </label>
          <select
            name="proof_of_reporting"
            value={formData.proof_of_reporting}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Select Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="In progress">In progress</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Frequency
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Select Frequency</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annually">Annually</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Responsible Person/Team
          </label>
          <input
            type="text"
            name="responsible_person_team"
            value={formData.responsible_person_team}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Review Date
          </label>
          <input
            type="date"
            name="review_date"
            value={formData.review_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Progress
          </label>
          <select
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Select Progress</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On-Track">On-Track</option>
            <option value="Minor Challenges">Minor Challenges</option>
            <option value="Major Challenges">Major Challenges</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Status Percentage
          </label>
          <input
            type="number"
            name="status_percentage"
            value={formData.status_percentage}
            onChange={handleChange}
            min="0"
            max="100"
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>
    </form>
  );
} 