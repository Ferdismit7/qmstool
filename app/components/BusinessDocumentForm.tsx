'use client';

import { useState, useEffect } from 'react';
import { BusinessDocument } from '../types/businessDocument';

interface BusinessDocumentFormProps {
  onAdd: (document: BusinessDocument) => void;
  onClose?: () => void;
  editData?: BusinessDocument;
}

export default function BusinessDocumentForm({ onAdd, onClose, editData }: BusinessDocumentFormProps) {
  const [formData, setFormData] = useState({
    business_area: '',
    sub_business_area: '',
    name_and_numbering: '',
    document_name: '',
    document_type: '',
    version: '',
    progress: '',
    status: '',
    status_percentage: 0,
    priority: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
    target_date: '',
    document_owner: '',
    remarks: '',
    review_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editData) {
      setFormData(prev => ({
        ...prev,
        ...editData,
        remarks: editData.remarks ?? '',
        target_date: editData.target_date ? new Date(editData.target_date).toISOString().split('T')[0] : '',
        review_date: editData.review_date ? new Date(editData.review_date).toISOString().split('T')[0] : '',
      }));
    }
  }, [editData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.business_area.trim()) newErrors.business_area = 'Business Area is required';
    if (!formData.sub_business_area.trim()) newErrors.sub_business_area = 'Sub Business Area is required';
    if (!formData.document_name.trim()) newErrors.document_name = 'Document Name is required';
    if (!formData.document_type) newErrors.document_type = 'Document Type is required';
    if (!formData.version.trim()) newErrors.version = 'Version is required';
    if (!formData.progress) newErrors.progress = 'Progress is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (formData.status_percentage < 0 || formData.status_percentage > 100) {
      newErrors.status_percentage = 'Status percentage must be between 0 and 100';
    }
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.target_date) newErrors.target_date = 'Target Date is required';
    if (!formData.document_owner.trim()) newErrors.document_owner = 'Document Owner is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataWithDate = {
      id: editData?.id || 0,
      ...formData,
      update_date: new Date().toISOString().split('T')[0],
      target_date: formData.target_date || null,
      review_date: formData.review_date || null,
      remarks: formData.remarks || null,
    };

    try {
    onAdd(dataWithDate);
      if (!editData) {
        // Only reset form if it's a new document
    setFormData({
          business_area: '',
          sub_business_area: '',
          name_and_numbering: '',
          document_name: '',
          document_type: '',
      version: '',
      progress: '',
      status: '',
          status_percentage: 0,
          priority: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
          target_date: '',
          document_owner: '',
      remarks: '',
          review_date: '',
    });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save document. Please try again.'
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status_percentage' ? Math.floor(parseInt(value) || 0) : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.submit && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
          {errors.submit}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label htmlFor="business_area" className="block text-sm font-semibold text-brand-white mb-1">Business Area</label>
          <input
            id="business_area"
            name="business_area"
            type="text"
            value={formData.business_area}
            onChange={handleChange}
            placeholder="Enter business area"
            className={`w-full rounded-md border ${errors.business_area ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.business_area && (
            <p className="mt-1 text-sm text-red-500">{errors.business_area}</p>
          )}
        </div>
        <div>
          <label htmlFor="sub_business_area" className="block text-sm font-semibold text-brand-white mb-1">Sub Business Area</label>
          <input
            id="sub_business_area"
            name="sub_business_area"
            type="text"
            value={formData.sub_business_area}
            onChange={handleChange}
            placeholder="Enter sub business area"
            className={`w-full rounded-md border ${errors.sub_business_area ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.sub_business_area && (
            <p className="mt-1 text-sm text-red-500">{errors.sub_business_area}</p>
          )}
        </div>
        <div>
          <label htmlFor="name_and_numbering" className="block text-sm font-semibold text-brand-white mb-1">Name and Numbering</label>
          <input
            id="name_and_numbering"
            name="name_and_numbering"
            type="text"
            value={formData.name_and_numbering}
            onChange={handleChange}
            placeholder="Enter name and numbering"
            className={`w-full rounded-md border ${errors.name_and_numbering ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.name_and_numbering && (
            <p className="mt-1 text-sm text-red-500">{errors.name_and_numbering}</p>
          )}
        </div>
        <div>
          <label htmlFor="document_name" className="block text-sm font-semibold text-brand-white mb-1">Document Name</label>
          <input
            id="document_name"
            name="document_name"
            type="text"
            value={formData.document_name}
            onChange={handleChange}
            placeholder="Enter document name"
            className={`w-full rounded-md border ${errors.document_name ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.document_name && (
            <p className="mt-1 text-sm text-red-500">{errors.document_name}</p>
          )}
        </div>
        <div>
          <label htmlFor="document_type" className="block text-sm font-semibold text-brand-white mb-1">Document Type</label>
          <select
            id="document_type"
            name="document_type"
            value={formData.document_type}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.document_type ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          >
            <option value="">Select document type</option>
            <option value="SOP">SOP</option>
            <option value="BP">BP</option>
            <option value="Policy">Policy</option>
            <option value="Form">Form</option>
            <option value="Training Manual">Training Manual</option>
          </select>
          {errors.document_type && (
            <p className="mt-1 text-sm text-red-500">{errors.document_type}</p>
          )}
        </div>
        <div>
          <label htmlFor="version" className="block text-sm font-semibold text-brand-white mb-1">Version</label>
          <input
            id="version"
            name="version"
            type="text"
            value={formData.version}
            onChange={handleChange}
            placeholder="Enter version"
            className={`w-full rounded-md border ${errors.version ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.version && (
            <p className="mt-1 text-sm text-red-500">{errors.version}</p>
          )}
        </div>
        <div>
          <label htmlFor="progress" className="block text-sm font-semibold text-brand-white mb-1">Progress</label>
          <select
            id="progress"
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.progress ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          >
            <option value="">Select progress</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On-Track">On-Track</option>
            <option value="Minor Challenges">Minor Challenges</option>
            <option value="Major Challenges">Major Challenges</option>
            <option value="Completed">Completed</option>
          </select>
          {errors.progress && (
            <p className="mt-1 text-sm text-red-500">{errors.progress}</p>
          )}
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-brand-white mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.status ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          >
            <option value="">Select status</option>
            <option value="To be reviewed">To be reviewed</option>
            <option value="In progress">In progress</option>
            <option value="New">New</option>
            <option value="Completed">Completed</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
          )}
        </div>
        <div>
          <label htmlFor="status_percentage" className="block text-sm font-semibold text-brand-white mb-1">Status Percentage</label>
          <input
            id="status_percentage"
            name="status_percentage"
            type="number"
            min="0"
            max="100"
            step="1"
            value={Math.floor(formData.status_percentage)}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.status_percentage ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.status_percentage && (
            <p className="mt-1 text-sm text-red-500">{errors.status_percentage}</p>
          )}
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-semibold text-brand-white mb-1">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.priority ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
          )}
        </div>
        <div>
          <label htmlFor="target_date" className="block text-sm font-semibold text-brand-white mb-1">Target Date</label>
          <input
            id="target_date"
            name="target_date"
            type="date"
            value={formData.target_date}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.target_date ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.target_date && (
            <p className="mt-1 text-sm text-red-500">{errors.target_date}</p>
          )}
        </div>
        <div>
          <label htmlFor="document_owner" className="block text-sm font-semibold text-brand-white mb-1">Document Owner</label>
          <input
            id="document_owner"
            name="document_owner"
            type="text"
            value={formData.document_owner}
            onChange={handleChange}
            placeholder="Enter document owner"
            className={`w-full rounded-md border ${errors.document_owner ? 'border-red-500' : 'border-brand-gray2'} bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none`}
            required
          />
          {errors.document_owner && (
            <p className="mt-1 text-sm text-red-500">{errors.document_owner}</p>
          )}
        </div>
        <div>
          <label htmlFor="remarks" className="block text-sm font-semibold text-brand-white mb-1">Remarks</label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter remarks"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="review_date" className="block text-sm font-semibold text-brand-white mb-1">Review Date</label>
          <input
            id="review_date"
            name="review_date"
            type="date"
            value={formData.review_date}
            onChange={handleChange}
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-brand-white hover:text-brand-gray2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/80"
        >
          {editData ? 'Update Document' : 'Add Document'}
        </button>
      </div>
    </form>
  );
} 