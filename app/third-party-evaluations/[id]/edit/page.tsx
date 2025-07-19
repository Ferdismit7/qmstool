'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

interface ThirdPartyEvaluation {
  id: number;
  supplier_name: string;
  business_area: string;
  evaluation_system_in_place: 'Yes' | 'No' | 'Planned';
  document_reference: string;
  last_evaluation_date: string;
  status_percentage: number;
  doc_status: 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started';
  progress: 'To be reviewed' | 'Completed' | 'In progress' | 'New';
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function EditThirdPartyEvaluationPage() {
  const router = useRouter();
  const params = useParams();
  const evaluationId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<ThirdPartyEvaluation | null>(null);
  const [formData, setFormData] = useState({
    supplier_name: '',
    business_area: '',
    evaluation_system_in_place: 'No' as 'Yes' | 'No' | 'Planned',
    document_reference: '',
    last_evaluation_date: '',
    status_percentage: 0,
    doc_status: 'Not Started' as 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started',
    progress: 'New' as 'To be reviewed' | 'Completed' | 'In progress' | 'New',
    notes: ''
  });

  // Fetch evaluation data and user business areas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user business areas
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const businessAreasResponse = await fetch('/api/auth/user-business-areas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (businessAreasResponse.ok) {
          const userData = await businessAreasResponse.json();
          setUserBusinessAreas(userData.businessAreas || []);
        }

        // Fetch evaluation data
        const evaluationResponse = await fetch(`/api/third-party-evaluations/${evaluationId}`);
        if (evaluationResponse.ok) {
          const evaluationData = await evaluationResponse.json();
          setEvaluation(evaluationData);
          
          // Format date for input field
          const formattedDate = evaluationData.last_evaluation_date 
            ? new Date(evaluationData.last_evaluation_date).toISOString().split('T')[0]
            : '';

          setFormData({
            supplier_name: evaluationData.supplier_name || '',
            business_area: evaluationData.business_area || '',
            evaluation_system_in_place: evaluationData.evaluation_system_in_place || 'No',
            document_reference: evaluationData.document_reference || '',
            last_evaluation_date: formattedDate,
            status_percentage: evaluationData.status_percentage || 0,
            doc_status: evaluationData.doc_status || 'Not Started',
            progress: evaluationData.progress || 'New',
            notes: evaluationData.notes || ''
          });
        } else {
          throw new Error('Failed to fetch evaluation');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load evaluation data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (evaluationId) {
      fetchData();
    }
  }, [evaluationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/third-party-evaluations/${evaluationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update evaluation');
      }

      router.push('/third-party-evaluations');
    } catch (error) {
      console.error('Error updating evaluation:', error);
      alert('Failed to update evaluation. Please try again.');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Evaluation not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/third-party-evaluations"
          className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
        >
          <FiArrowLeft size={16} />
          Back to Evaluations
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Edit Third-Party Evaluation</h1>
        <p className="text-brand-gray3 mt-1">Update supplier evaluation record</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Name */}
            <div>
              <label htmlFor="supplier_name" className="block text-sm font-medium text-brand-white mb-2">
                Supplier Name *
              </label>
              <input
                type="text"
                id="supplier_name"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-brand-gray1 border border-brand-gray2 rounded-lg text-brand-white placeholder-brand-gray3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter supplier name"
              />
            </div>

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

            {/* Evaluation System in Place */}
            <div>
              <label htmlFor="evaluation_system_in_place" className="block text-sm font-medium text-brand-white mb-2">
                Evaluation System in Place *
              </label>
              <select
                id="evaluation_system_in_place"
                name="evaluation_system_in_place"
                value={formData.evaluation_system_in_place}
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

            {/* Last Evaluation Date */}
            <div>
              <label htmlFor="last_evaluation_date" className="block text-sm font-medium text-brand-white mb-2">
                Last Evaluation Date
              </label>
              <input
                type="date"
                id="last_evaluation_date"
                name="last_evaluation_date"
                value={formData.last_evaluation_date}
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
            href="/third-party-evaluations"
            className="px-4 py-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave size={16} />
            {isSubmitting ? 'Updating...' : 'Update Evaluation'}
          </button>
        </div>
      </form>
    </div>
  );
} 