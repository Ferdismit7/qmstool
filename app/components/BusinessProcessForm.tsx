'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type BusinessProcess = {
  id?: number;
  sub_business_area: string;
  process_name: string;
  document_name: string;
  version: string;
  progress: string;
  doc_status: string;
  status_percentage: number;
  priority: string;
  target_date: string;
  process_owner: string;
  remarks: string;
  review_date: string;
}

type Props = {
  mode: 'create' | 'edit';
  process?: BusinessProcess;
}

export default function BusinessProcessForm({ mode, process }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState<BusinessProcess>(
    process ? {
      ...process,
      target_date: process.target_date ? new Date(process.target_date).toISOString().split('T')[0] : '',
      review_date: process.review_date ? new Date(process.review_date).toISOString().split('T')[0] : ''
    } : {
      sub_business_area: '',
      process_name: '',
      document_name: '',
      version: '1.0',
      progress: 'NOT_STARTED',
      doc_status: 'DRAFT',
      status_percentage: 0,
      priority: 'MEDIUM',
      target_date: '',
      process_owner: '',
      remarks: '',
      review_date: ''
    }
  );

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
          
          // If creating a new process, pre-populate with user's first business area
          if (mode === 'create' && userData.businessAreas.length > 0) {
            setFormData(prev => ({
              ...prev,
              sub_business_area: userData.businessAreas[0]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'create' 
        ? '/api/business-processes'
        : `/api/business-processes/${process?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      console.log('Submitting form data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save business process');
      }

      router.push('/business-processes');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save business process');
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
          className="px-6 py-2 rounded-lg border border-brand-gray3/50 bg-brand-dark/50 text-brand-white hover:bg-brand-gray3 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg border border-brand-gray3/50 bg-brand-dark/50 text-white hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sub_business_area" className="block text-sm font-medium text-brand-gray3 mb-2">
            Sub Business Area
          </label>
          <select
            id="sub_business_area"
            name="sub_business_area"
            value={formData.sub_business_area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Business Area</option>
            {userBusinessAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="process_name" className="block text-sm font-medium text-brand-gray3 mb-2">
            Process Name
          </label>
          <input
            type="text"
            id="process_name"
            name="process_name"
            value={formData.process_name}
            onChange={handleChange}
            placeholder="Enter process name"
            required
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="document_name" className="block text-sm font-medium text-brand-gray3 mb-2">
            Document Name
          </label>
          <input
            type="text"
            id="document_name"
            name="document_name"
            value={formData.document_name}
            onChange={handleChange}
            placeholder="Enter document name"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            value={formData.version}
            onChange={handleChange}
            placeholder="Enter version"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_TRACK">On Track</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELAYED">Delayed</option>
          </select>
        </div>

        <div>
          <label htmlFor="doc_status" className="block text-sm font-medium text-brand-gray3 mb-2">
            Document Status
          </label>
          <select
            id="doc_status"
            name="doc_status"
            value={formData.doc_status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
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
            placeholder="Enter percentage"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
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
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="process_owner" className="block text-sm font-medium text-brand-gray3 mb-2">
            Process Owner
          </label>
          <input
            type="text"
            id="process_owner"
            name="process_owner"
            value={formData.process_owner}
            onChange={handleChange}
            placeholder="Enter process owner"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="review_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Review Date
          </label>
          <input
            type="date"
            id="review_date"
            name="review_date"
            value={formData.review_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="remarks" className="block text-sm font-medium text-brand-gray3 mb-2">
          Remarks
        </label>
        <textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter remarks"
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
        />
      </div>
    </form>
  );
} 