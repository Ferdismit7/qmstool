'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Interface representing a Risk Management Control
 * @interface RiskManagementControl
 */
interface RiskManagementControl {
  /** Unique identifier for the control (optional for new controls) */
  id?: number;
  /** Name of the process this control is associated with */
  process_name: string;
  /** Business area this control is associated with */
  business_area: string;
  /** Description of the activity being controlled */
  activity_description?: string;
  /** Description of the issue being addressed */
  issue_description: string;
  /** Type of issue being addressed */
  issue_type?: string;
  /** Inherent risk likelihood score (1-5) */
  inherent_risk_likeliness?: number;
  /** Inherent risk impact score (1-5) */
  inherent_risk_impact?: number;
  /** Calculated inherent risk score (likelihood * impact) */
  inherent_risk_score?: number;
  /** Description of the control measure */
  control_description?: string;
  /** Type of control measure */
  control_type?: 'Preventive' | 'Detective' | 'Corrective';
  /** Person responsible for the control */
  control_owner?: string;
  /** Effectiveness rating of the control */
  control_effectiveness?: 'High' | 'Medium' | 'Low';
  /** Residual risk likelihood score (1-5) */
  residual_risk_likeliness?: number;
  /** Current status of the control */
  status?: 'Open' | 'Under Review' | 'Closed';
  /** Progress status of the control */
  doc_status?: 'Not Started' | 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges';
  /** Control progress percentage */
  control_progress?: number;
  /** Control target date */
  control_target_date?: string;
  /** Residual risk impact score (1-5) */
  residual_risk_impact?: number;
  /** Residual risk overall score */
  residual_risk_overall_score?: number;
  /** File upload URL */
  file_url?: string;
  /** File name */
  file_name?: string;
  /** File size */
  file_size?: number;
  /** File type */
  file_type?: string;
}

/**
 * Props for the RiskManagementForm component
 * @interface RiskManagementFormProps
 */
interface RiskManagementFormProps {
  /** Optional existing control data for editing mode */
  control?: RiskManagementControl;
  /** Callback function when form is successfully submitted */
  onSuccess?: () => void;
  /** Callback function when form is cancelled */
  onCancel?: () => void;
  /** Whether the form is in view-only mode */
  isViewMode?: boolean;
}

/**
 * RiskManagementForm Component
 * 
 * A form component for creating and editing risk management controls.
 * Features include:
 * - Form validation
 * - Dynamic form state management
 * - Automatic risk score calculation
 * - Control effectiveness tracking
 * - Status monitoring
 * - Responsive design
 * - Accessibility features
 * 
 * @component
 * @param {RiskManagementFormProps} props - Component props
 * @example
 * ```tsx
 * // Create mode
 * <RiskManagementForm />
 * 
 * // Edit mode
 * <RiskManagementForm control={existingControl} />
 * ```
 * 
 * @returns {JSX.Element} A form for creating or editing risk management controls
 */
export default function RiskManagementForm({ control, onSuccess, onCancel, isViewMode = false }: RiskManagementFormProps) {
  const router = useRouter();
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState<RiskManagementControl>({
    process_name: '',
    business_area: '',
    activity_description: '',
    issue_description: '',
    issue_type: '',
    inherent_risk_likeliness: 1,
    inherent_risk_impact: 1,
    control_description: '',
    control_type: 'Preventive',
    control_owner: '',
    control_effectiveness: 'Medium',
    residual_risk_likeliness: 1,
    status: 'Open',
    doc_status: 'Not Started',
    control_progress: 0,
    residual_risk_impact: 1,
    residual_risk_overall_score: 1,
    ...control
  });

  const [loading, setLoading] = useState(false);
  const [calculatedInherentRiskScore, setCalculatedInherentRiskScore] = useState<number | null>(null);
  const [calculatedResidualRiskScore, setCalculatedResidualRiskScore] = useState<number | null>(null);

  /**
   * Effect to calculate inherent risk score when likelihood or impact changes
   */
  useEffect(() => {
    if (formData.inherent_risk_likeliness !== undefined && formData.inherent_risk_likeliness !== null && 
        formData.inherent_risk_impact !== undefined && formData.inherent_risk_impact !== null) {
      setCalculatedInherentRiskScore((formData.inherent_risk_likeliness || 0) * (formData.inherent_risk_impact || 0));
    } else {
      setCalculatedInherentRiskScore(null);
    }
  }, [formData.inherent_risk_likeliness, formData.inherent_risk_impact]);

  /**
   * Effect to calculate residual risk score when residual likelihood or impact changes
   */
  useEffect(() => {
    if (formData.residual_risk_likeliness !== undefined && formData.residual_risk_likeliness !== null && 
        formData.residual_risk_impact !== undefined && formData.residual_risk_impact !== null) {
      setCalculatedResidualRiskScore((formData.residual_risk_likeliness || 0) * (formData.residual_risk_impact || 0));
    } else {
      setCalculatedResidualRiskScore(null);
    }
  }, [formData.residual_risk_likeliness, formData.residual_risk_impact]);

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
          if (!control && userData.businessAreas.length > 0) {
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
  }, [control]);

  /**
   * Handles form submission
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data with calculated scores
      const formDataToSubmit = {
        ...formData,
        inherent_risk_score: calculatedInherentRiskScore,
        residual_risk_overall_score: calculatedResidualRiskScore
      };

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

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/risk-management');
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save risk management control');
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
    const numericFields = ['inherent_risk_likeliness', 'inherent_risk_impact', 'residual_risk_likeliness', 'residual_risk_impact', 'control_progress'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? Number(value) || null
        : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end space-x-4 mb-6">
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="px-6 py-2 rounded-lg bg-brand-dark/30 border border-brand-gray3 text-brand-white hover:bg-brand-white/40 transition-colors"
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-brand-dark/30 border border-brand-gray3 text-white hover:bg-brand-white/40 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : control ? 'Update' : 'Create'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Business Area *
          </label>
          <select
            name="business_area"
            value={formData.business_area}
            onChange={handleChange}
            required
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <option value="">Select Business Area</option>
            {userBusinessAreas.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Process Name *
          </label>
          <input
            type="text"
            name="process_name"
            value={formData.process_name}
            onChange={handleChange}
            required
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Activity Description
          </label>
          <textarea
            name="activity_description"
            value={formData.activity_description}
            onChange={handleChange}
            rows={3}
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Issue Description *
          </label>
          <textarea
            name="issue_description"
            value={formData.issue_description}
            onChange={handleChange}
            required
            rows={3}
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Issue Type
          </label>
          <input
            type="text"
            name="issue_type"
            value={formData.issue_type}
            onChange={handleChange}
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Inherent Risk Likelihood (1-5)
          </label>
          <input
            type="number"
            name="inherent_risk_likeliness"
            value={formData.inherent_risk_likeliness || ''}
            onChange={handleChange}
            min="1"
            max="5"
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Inherent Risk Impact (1-5)
          </label>
          <input
            type="number"
            name="inherent_risk_impact"
            value={formData.inherent_risk_impact || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Inherent Risk Score (Calculated)
          </label>
          <input
            type="number"
            value={calculatedInherentRiskScore || ''}
            readOnly
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Control Description
          </label>
          <textarea
            name="control_description"
            value={formData.control_description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Control Type
          </label>
          <select
            name="control_type"
            value={formData.control_type || ''}
            onChange={handleChange}
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <option value="">Select Type</option>
            <option value="Preventive">Preventive</option>
            <option value="Detective">Detective</option>
            <option value="Corrective">Corrective</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Control Owner
          </label>
          <input
            type="text"
            name="control_owner"
            value={formData.control_owner}
            onChange={handleChange}
            disabled={isViewMode}
            className={`w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1 ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Control Effectiveness
          </label>
          <select
            name="control_effectiveness"
            value={formData.control_effectiveness || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Effectiveness</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Control Progress (%)
          </label>
          <input
            type="number"
            name="control_progress"
            value={formData.control_progress || ''}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Control Target Date
          </label>
          <input
            type="date"
            name="control_target_date"
            value={formData.control_target_date || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Residual Risk Likelihood (1-5)
          </label>
          <input
            type="number"
            name="residual_risk_likeliness"
            value={formData.residual_risk_likeliness || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Residual Risk Impact (1-5)
          </label>
          <input
            type="number"
            name="residual_risk_impact"
            value={formData.residual_risk_impact || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Residual Risk Overall Score (Calculated)
          </label>
          <input
            type="number"
            value={calculatedResidualRiskScore || ''}
            readOnly
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Status</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Progress
          </label>
          <select
            name="doc_status"
            value={formData.doc_status || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Progress</option>
            <option value="Not Started">Not Started</option>
            <option value="On-Track">On-Track</option>
            <option value="Completed">Completed</option>
            <option value="Minor Challenges">Minor Challenges</option>
            <option value="Major Challenges">Major Challenges</option>
          </select>
        </div>
      </div>
    </form>
  );
} 