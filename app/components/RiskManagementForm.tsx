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
  /** Likelihood score (1-5) */
  likelihood?: number;
  /** Impact score (1-5) */
  impact?: number;
  /** Calculated risk score (likelihood * impact) */
  risk_score?: number;
  /** Description of the control measure */
  control_description?: string;
  /** Type of control measure */
  control_type?: 'Preventive' | 'Detective' | 'Corrective';
  /** Person responsible for the control */
  control_owner?: string;
  /** Effectiveness rating of the control */
  control_effectiveness?: 'High' | 'Medium' | 'Low';
  /** Remaining risk after control implementation */
  residual_risk?: number;
  /** Current status of the control */
  status?: 'Open' | 'Under Review' | 'Closed';
}

/**
 * Props for the RiskManagementForm component
 * @interface RiskManagementFormProps
 */
interface RiskManagementFormProps {
  /** Optional existing control data for editing mode */
  control?: RiskManagementControl;
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
export default function RiskManagementForm({ control }: RiskManagementFormProps) {
  const router = useRouter();
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState<RiskManagementControl>({
    process_name: '',
    business_area: '',
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

  /**
   * Effect to calculate risk score when likelihood or impact changes
   */
  useEffect(() => {
    if (formData.likelihood !== undefined && formData.likelihood !== null && 
        formData.impact !== undefined && formData.impact !== null) {
      setCalculatedRiskScore((formData.likelihood || 0) * (formData.impact || 0));
    } else {
      setCalculatedRiskScore(null);
    }
  }, [formData.likelihood, formData.impact]);

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
      // Remove risk_score from the data being sent
      const { ...formDataToSubmit } = formData;

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
          className="px-6 py-2 rounded-lg bg-brand-dark/30 border border-brand-gray3 text-brand-white hover:bg-brand-white/40 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-brand-dark/30 border border-brand-gray3 text-white hover:bg-brand-white/40 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : control ? 'Update' : 'Create'}
        </button>
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Likelihood (1-5)
          </label>
          <input
            type="number"
            name="likelihood"
            value={formData.likelihood || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Impact (1-5)
          </label>
          <input
            type="number"
            name="impact"
            value={formData.impact || ''}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray3 mb-2">
            Risk Score (Calculated)
          </label>
          <input
            type="number"
            value={calculatedRiskScore || ''}
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray3 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            Residual Risk (1-5)
          </label>
          <input
            type="number"
            name="residual_risk"
            value={formData.residual_risk || ''}
            onChange={handleChange}
            min="1"
            max="5"
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
      </div>
    </form>
  );
} 