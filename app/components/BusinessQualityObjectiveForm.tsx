'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUploadField from './FileUploadField';

/**
 * Interface representing a Business Quality Objective
 * @interface BusinessQualityObjective
 */
interface BusinessQualityObjective {
  /** Unique identifier for the objective (optional for new objectives) */
  id?: number;
  /** Category of the objective (e.g., Client Experience, Performance Efficiencies) */
  category: string;
  /** Main business area the objective belongs to */
  business_area: string;
  /** Specific sub-area within the business area */
  sub_business_area: string;
  /** Main objectives of the QMS system */
  qms_main_objectives: string;
  /** Detailed description of the QMS objective */
  qms_objective_description: string;
  /** Key Performance Indicators or Service Level Agreement targets */
  kpi_or_sla_targets: string;
  /** Method or process for monitoring performance */
  performance_monitoring: string;
  /** Evidence or method of measuring progress */
  proof_of_measuring: string;
  /** Evidence or method of reporting progress */
  proof_of_reporting: string;
  /** How often the objective is reviewed */
  frequency: string;
  /** Person or team responsible for the objective */
  responsible_person_team: string;
  /** Date when the objective should be reviewed */
  review_date: string;
  /** Current progress status of the objective */
  progress: string;
  /** Percentage completion of the objective (0-100) */
  status_percentage: number;
  /** Document status of the objective */
  doc_status: string;
  /** File URL for uploaded document */
  file_url?: string;
  /** File name of uploaded document */
  file_name?: string;
  /** File size of uploaded document */
  file_size?: number;
  /** File type of uploaded document */
  file_type?: string;
}

/**
 * Props for the BusinessQualityObjectiveForm component
 * @interface Props
 */
interface Props {
  /** Optional existing objective data for editing mode */
  objective?: BusinessQualityObjective;
  /** Form mode - either creating a new objective or editing an existing one */
  mode: 'create' | 'edit';
}

/**
 * BusinessQualityObjectiveForm Component
 * 
 * A form component for creating and editing business quality objectives.
 * Features include:
 * - Form validation
 * - Dynamic form state management
 * - Date formatting
 * - Error handling
 * - Loading states
 * - Responsive design
 * - Accessibility features
 * 
 * @component
 * @param {Props} props - Component props
 * @example
 * ```tsx
 * // Create mode
 * <BusinessQualityObjectiveForm mode="create" />
 * 
 * // Edit mode
 * <BusinessQualityObjectiveForm 
 *   mode="edit"
 *   objective={existingObjective}
 * />
 * ```
 * 
 * @returns {JSX.Element} A form for creating or editing business quality objectives
 */
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
    doc_status: '',
    ...objective
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);

  /**
   * Fetch user's business areas on component mount
   */
  useEffect(() => {
    const fetchUserBusinessAreas = async () => {
      try {
        // Get the token from localStorage or sessionStorage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const response = await fetch('/api/auth/user-business-areas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserBusinessAreas(userData.businessAreas || []);
          
          // If creating a new objective, pre-populate with user's first business area
          if (mode === 'create' && userData.businessAreas.length > 0) {
            setFormData(prev => ({
              ...prev,
              business_area: userData.businessAreas[0]
            }));
          }
        } else {
          console.error('Failed to fetch user business areas:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user business areas:', error);
      }
    };

    fetchUserBusinessAreas();
  }, [mode]);

  /**
   * Effect to format the review date when an existing objective is provided
   */
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

  /**
   * Handles form submission
   * @param {React.FormEvent} e - The form submission event
   */
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

  /**
   * Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
   */
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
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50 disabled:opacity-50"
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
          <select
            name="business_area"
            value={formData.business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Select Business Area</option>
            {userBusinessAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
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
            <option value="Completed">Completed</option>
            <option value="On-Track">On-Track</option>
            <option value="Minor Challenges">Minor Challenges</option>
            <option value="Major Challenges">Major Challenges</option>
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
            required
            min="0"
            max="100"
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white mb-2">
            Status
          </label>
          <select
            name="doc_status"
            value={formData.doc_status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Select Status</option>
            <option value="Completed">Completed</option>
            <option value="New">New</option>
            <option value="In progress">In progress</option>
            <option value="To be reviewed">To be reviewed</option>
          </select>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mt-6">
        <FileUploadField
          label="Upload Document"
          value={{
            file_url: formData.file_url,
            file_name: formData.file_name,
            file_size: formData.file_size,
            file_type: formData.file_type,
          }}
          onChange={(fileData) => {
            setFormData(prev => ({
              ...prev,
              ...fileData,
              uploaded_at: fileData.uploaded_at ? (typeof fileData.uploaded_at === 'string' ? fileData.uploaded_at : fileData.uploaded_at.toISOString()) : ''
            }));
          }}
          onRemove={() => {
            setFormData(prev => ({
              ...prev,
              file_url: undefined,
              file_name: undefined,
              file_size: undefined,
              file_type: undefined,
            }));
          }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
          maxSize={10}
          businessArea={formData.business_area}
          documentType="quality-objectives"
        />
      </div>
    </form>
  );
} 