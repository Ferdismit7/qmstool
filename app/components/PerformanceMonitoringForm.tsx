'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUploadField from './FileUploadField';
import { incrementVersion } from '@/lib/utils/versionIncrement';



/**
 * Interface representing a Performance Monitoring Control
 */
type PerformanceMonitoringControl = {
  /** Unique identifier for the control (optional for new controls) */
  id?: number;
  /** Main business area the control is associated with */
  business_area: string;
  /** Specific sub-area within the business area */
  sub_business_area: string;
  /** Name of the report or monitoring item */
  Name_reports: string;
  /** Type of monitoring control */
  doc_type: string;
  /** Priority level of the control */
  priority: string;
  /** Current status of the control */
  doc_status: string;
  /** Progress status of the control */
  progress: string;
  /** Percentage completion of the control (0-100) */
  status_percentage: number;
  /** Target date for completion */
  target_date: string;
  /** Evidence or proof of monitoring */
  proof: string;
  /** How often the control is monitored */
  frequency: string;
  /** Person(s) responsible for the control */
  responsible_persons: string;
  /** Additional remarks or notes */
  remarks: string;
  /** Version of the control document */
  version?: string;
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
 * Props for the PerformanceMonitoringForm component
 */
type Props = {
  /** Form mode - either creating a new control or editing an existing one */
  mode: 'create' | 'edit';
  /** Optional existing control data for editing mode */
  control?: PerformanceMonitoringControl;
}

/**
 * Helper function to safely format date for input fields
 * @param {string | null | undefined} date - The date to format
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
const getDateInputValue = (date: string | null | undefined): string => {
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

/**
 * PerformanceMonitoringForm Component
 * 
 * A form component for creating and editing performance monitoring controls.
 * Features include:
 * - Form validation
 * - Dynamic form state management
 * - Date formatting and handling
 * - Progress tracking
 * - Priority management
 * - Status monitoring
 * - Responsive design
 * - Accessibility features
 * 
 * @component
 * @param {Props} props - Component props
 * @example
 * ```tsx
 * // Create mode
 * <PerformanceMonitoringForm mode="create" />
 * 
 * // Edit mode
 * <PerformanceMonitoringForm 
 *   mode="edit"
 *   control={existingControl}
 * />
 * ```
 * 
 *
 */
export default function PerformanceMonitoringForm({ mode, control }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState<PerformanceMonitoringControl>(
    control ? {
      ...control,
      target_date: getDateInputValue(control.target_date)
    } : {
      business_area: '',
      sub_business_area: '',
      Name_reports: '',
      doc_type: '',
      priority: '',
      doc_status: '',
      progress: '',
      status_percentage: 0,
      target_date: '',
      proof: '',
      frequency: '',
      responsible_persons: '',
      remarks: '',
      version: ''
    }
  );

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
          
          // If creating a new control, pre-populate with user's first business area
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
   * Handles form submission
   * @param {React.FormEvent} e - The form submission event
   */
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
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="business_area" className="block text-sm font-medium text-brand-gray3 mb-2">
            Business Area
          </label>
          <select
            id="business_area"
            name="business_area"
            value={formData.business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Business Area</option>
            {userBusinessAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sub_business_area" className="block text-sm font-medium text-brand-gray3 mb-2">
            Sub Business Area
          </label>
          <input
            type="text"
            id="sub_business_area"
            name="sub_business_area"
            value={formData.sub_business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="Name_reports" className="block text-sm font-medium text-brand-gray3 mb-2">
            Report Name
          </label>
          <input
            type="text"
            id="Name_reports"
            name="Name_reports"
            value={formData.Name_reports}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="doc_type" className="block text-sm font-medium text-brand-gray3 mb-2">
            Type
          </label>
          <input
            type="text"
            id="doc_type"
            name="doc_type"
            value={formData.doc_type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-brand-gray3 mb-2">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label htmlFor="doc_status" className="block text-sm font-medium text-brand-gray3 mb-2">
            Status
          </label>
          <select
            id="doc_status"
            name="doc_status"
            value={formData.doc_status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Status</option>
            <option value="Completed">Completed</option>
            <option value="To be reviewed">To be reviewed</option>
            <option value="New">New</option>
            <option value="In progress">In progress</option>
          </select>
        </div>

        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-brand-gray3 mb-2">
            Progress
          </label>
          <select
            id="progress"
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Progress</option>
            <option value="Completed">Completed</option>
            <option value="On-Track">On-Track</option>
            <option value="Minor Challenges">Minor Challenges</option>
            <option value="Major Challenges">Major Challenges</option>
          </select>
        </div>

        <div>
          <label htmlFor="status_percentage" className="block text-sm font-medium text-brand-gray3 mb-2">
            Status Percentage
          </label>
          <input
            type="number"
            id="status_percentage"
            name="status_percentage"
            value={formData.status_percentage}
            onChange={handleChange}
            min="0"
            max="100"
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="target_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Target Date
          </label>
          <input
            type="date"
            id="target_date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="proof" className="block text-sm font-medium text-brand-gray3 mb-2">
            Proof
          </label>
          <input
            type="text"
            id="proof"
            name="proof"
            value={formData.proof}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-brand-gray3 mb-2">
            Frequency
          </label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
          <label htmlFor="responsible_persons" className="block text-sm font-medium text-brand-gray3 mb-2">
            Responsible Persons
          </label>
          <input
            type="text"
            id="responsible_persons"
            name="responsible_persons"
            value={formData.responsible_persons}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="remarks" className="block text-sm font-medium text-brand-gray3 mb-2">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="version" className="block text-sm font-medium text-brand-gray3 mb-2">
            Version
          </label>
          <input
            type="text"
            id="version"
            name="version"
            value={formData.version || ''}
            onChange={handleChange}
            placeholder="Enter version (e.g., 1.0)"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mt-6">
        <FileUploadField
          label="Upload Document"
          value={
            // When editing, don't show the current file - it should be empty
            // The current file is visible on the detail page with version filtering
            mode === 'edit' ? {
              file_url: undefined,
              file_name: undefined,
              file_size: undefined,
              file_type: undefined,
            } : {
              file_url: formData.file_url,
              file_name: formData.file_name,
              file_size: formData.file_size,
              file_type: formData.file_type,
            }
          }
          onChange={(fileData) => {
            const hasNewFile = fileData.file_url && fileData.file_url !== formData.file_url;
            
            setFormData(prev => ({
              ...prev,
              ...fileData,
              // Auto-increment version if editing and new file uploaded
              version: (mode === 'edit' && hasNewFile) 
                ? incrementVersion(prev.version || '1.0')
                : prev.version,
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
          documentType="performance-monitoring"
        />
      </div>
    </form>
  );
} 