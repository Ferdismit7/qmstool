'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function NewCustomerFeedbackSystemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    business_area: '',
    has_feedback_system: 'No' as 'Yes' | 'No' | 'Planned',
    document_reference: '',
    last_review_date: '',
    status_percentage: 0,
    doc_status: 'Not Started' as 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started',
    progress: 'New' as 'To be reviewed' | 'Completed' | 'In progress' | 'New',
    notes: ''
  });

  // Fetch user's business areas on component mount
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
          
          // Pre-populate with user's first business area
          if (userData.businessAreas.length > 0) {
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/customer-feedback-systems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create feedback system');
      }

      router.push('/customer-feedback-systems');
    } catch (error) {
      console.error('Error creating feedback system:', error);
      alert('Failed to create feedback system. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status_percentage' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/customer-feedback-systems"
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiArrowLeft size={16} />
          Back to Feedback Systems
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Add New Customer Feedback System</h1>
        <p className="text-brand-gray3 mt-1">Create a new customer feedback system record</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Area */}
            <div>
              <label htmlFor="business_area" className="block text-sm font-medium text-brand-white mb-2">
                Business Area *
              </label>
              <select
                id="business_area"
                name="business_area"
                value={formData.business_area}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select Business Area</option>
                {userBusinessAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Has Feedback System */}
            <div>
              <label htmlFor="has_feedback_system" className="block text-sm font-medium text-brand-white mb-2">
                Has Feedback System *
              </label>
              <select
                id="has_feedback_system"
                name="has_feedback_system"
                value={formData.has_feedback_system}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Planned">Planned</option>
              </select>
            </div>

            {/* Document Reference */}
            <div>
              <label htmlFor="document_reference" className="block text-sm font-medium text-brand-white mb-2">
                Document Reference
              </label>
              <input
                type="text"
                id="document_reference"
                name="document_reference"
                value={formData.document_reference}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white placeholder-brand-gray3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter document reference"
              />
            </div>

            {/* Last Review Date */}
            <div>
              <label htmlFor="last_review_date" className="block text-sm font-medium text-brand-white mb-2">
                Last Review Date
              </label>
              <input
                type="date"
                id="last_review_date"
                name="last_review_date"
                value={formData.last_review_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Status Percentage */}
            <div>
              <label htmlFor="status_percentage" className="block text-sm font-medium text-brand-white mb-2">
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
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="0-100"
              />
            </div>

            {/* Document Status */}
            <div>
              <label htmlFor="doc_status" className="block text-sm font-medium text-brand-white mb-2">
                Document Status *
              </label>
              <select
                id="doc_status"
                name="doc_status"
                value={formData.doc_status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="Not Started">Not Started</option>
                <option value="On-Track">On-Track</option>
                <option value="Completed">Completed</option>
                <option value="Minor Challenges">Minor Challenges</option>
                <option value="Major Challenges">Major Challenges</option>
              </select>
            </div>

            {/* Progress */}
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-brand-white mb-2">
                Progress *
              </label>
              <select
                id="progress"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="New">New</option>
                <option value="In progress">In progress</option>
                <option value="To be reviewed">To be reviewed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-brand-white mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white placeholder-brand-gray3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Enter any additional notes..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/customer-feedback-systems"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave size={12} />
            {isSubmitting ? 'Creating...' : 'Create Feedback System'}
          </button>
        </div>
      </form>
    </div>
  );
} 