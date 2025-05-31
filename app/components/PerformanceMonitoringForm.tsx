'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PerformanceMonitoringControl {
  id?: number;
  business_area: string;
  sub_business_area: string;
  Name_reports: string;
  type: string;
  priority: string;
  status: string;
  progress: string;
  status_percentage: number;
  target_date: string;
  proof: string;
  frequency: string;
  responsible_persons: string;
  remarks: string;
}

interface Props {
  mode: 'create' | 'edit';
  control?: PerformanceMonitoringControl;
}

// Helper to safely format date for input
const getDateInputValue = (date: string | null | undefined) => {
  if (!date) return '';
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse and format
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  }
  return '';
};

export default function PerformanceMonitoringForm({ mode, control }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PerformanceMonitoringControl>(
    control ? {
      ...control,
      target_date: getDateInputValue(control.target_date)
    } : {
      business_area: '',
      sub_business_area: '',
      Name_reports: '',
      type: '',
      priority: '',
      status: '',
      progress: '',
      status_percentage: 0,
      target_date: '',
      proof: '',
      frequency: '',
      responsible_persons: '',
      remarks: ''
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'create' 
        ? '/api/performance-monitoring'
        : `/api/performance-monitoring/${control?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save performance monitoring control');
      }

      router.push('/performance-monitoring');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save performance monitoring control');
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
      [name]: value
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
          {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Business Area
          </label>
          <input
            type="text"
            name="business_area"
            value={formData.business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Sub Business Area
          </label>
          <input
            type="text"
            name="sub_business_area"
            value={formData.sub_business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Report Name
          </label>
          <input
            type="text"
            name="Name_reports"
            value={formData.Name_reports}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Type
          </label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Progress
          </label>
          <select
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Select Progress</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Target Date
          </label>
          <input
            type="date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Proof
          </label>
          <input
            type="text"
            name="proof"
            value={formData.proof}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Frequency
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
          <label className="block text-sm font-medium text-brand-gray2 mb-2">
            Responsible Persons
          </label>
          <input
            type="text"
            name="responsible_persons"
            value={formData.responsible_persons}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-gray2 mb-2">
          Remarks
        </label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </div>
    </form>
  );
} 