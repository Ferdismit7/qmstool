'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

// Props for the ProcessForm component
interface ProcessFormProps {
  isOpen: boolean; // Whether the modal is open
  onClose: () => void; // Function to close the modal
  onSubmit: (process: any) => void; // Function to handle form submission
  initialData?: any; // Data for editing an existing process (optional)
}

// Initial state for a new process form
const initialFormState = {
  businessArea: '',
  subBusinessArea: '',
  processName: '',
  documentName: '',
  version: '',
  progress: '', // blank by default, user must select
  status: '',   // blank by default, user must select
  statusPercentage: '', // blank by default, user must enter
  priority: '', // blank by default, user must select
  targetDate: '',
  processOwner: '',
  updateDate: '', // will be set to current date on open
  remarks: '',
  reviewDate: '',
};

// Dropdown options for progress, status, and priority
const progressOptions = [
  'Completed',
  'On-Track',
  'Minor Challenges',
  'Major Challenges',
];
const statusOptions = [
  'Completed',
  'In progress',
  'New',
  'To be reviewed',
];
const priorityOptions = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

/**
 * ProcessForm component renders a modal form for adding or editing a business process.
 * - When opened for adding, all fields are blank/default.
 * - When opened for editing, fields are pre-filled with the selected process data.
 * - Dropdowns and date fields have styled placeholders for clarity.
 */
export default function ProcessForm({ isOpen, onClose, onSubmit, initialData }: ProcessFormProps) {
  // State for form data
  const [formData, setFormData] = useState(initialFormState);

  // Effect: Reset form data when modal is opened or when editing a process
  useEffect(() => {
    if (isOpen) {
      const now = new Date().toISOString().split('T')[0]; // Current date in yyyy-mm-dd
      if (initialData) {
        // Editing: pre-fill with data and update the date
        setFormData({ ...initialData, updateDate: now });
      } else {
        // Adding: reset to initial state and set update date
        setFormData({ ...initialFormState, updateDate: now });
      }
    }
  }, [isOpen, initialData]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // Pass form data to parent
    onClose(); // Close the modal
  };

  // Do not render the modal if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal container with dark gradient and rounded corners */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-8">
          {/* Modal header with title and close button */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-100">
              {initialData ? 'Edit Process' : 'Add New Process'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 bg-gray-800 rounded-full p-2 transition"
              aria-label="Close"
            >
              <FiX size={28} />
            </button>
          </div>

          {/* The form itself */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Area field (text) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Business Area</label>
                <input
                  type="text"
                  value={formData.businessArea}
                  onChange={(e) => setFormData({ ...formData, businessArea: e.target.value })}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter business area"
                  required
                />
              </div>
              {/* Sub Business Area field (text) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sub Business Area</label>
                <input
                  type="text"
                  value={formData.subBusinessArea}
                  onChange={(e) => setFormData({ ...formData, subBusinessArea: e.target.value })}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter sub business area"
                  required
                />
              </div>
              {/* Process Name field (text) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Process Name</label>
                <input
                  type="text"
                  value={formData.processName}
                  onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter process name"
                  required
                />
              </div>
              {/* Document Name field (text) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Document Name</label>
                <input
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter document name"
                  required
                />
              </div>
              {/* Version field (text) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter version"
                  required
                />
              </div>
              {/* Progress dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Progress</label>
                <select
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.progress ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  required
                >
                  {/* Placeholder option, styled light grey and italic */}
                  <option value="" disabled className="text-gray-400 italic">Select progress</option>
                  {progressOptions.map(option => (
                    <option key={option} value={option} className="text-gray-100 not-italic">{option}</option>
                  ))}
                </select>
              </div>
              {/* Status dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.status ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  required
                >
                  {/* Placeholder option, styled light grey and italic */}
                  <option value="" disabled className="text-gray-400 italic">Select status</option>
                  {statusOptions.map(option => (
                    <option key={option} value={option} className="text-gray-100 not-italic">{option}</option>
                  ))}
                </select>
              </div>
              {/* Status Percentage field (number) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.statusPercentage}
                  onChange={(e) => setFormData({ ...formData, statusPercentage: e.target.value })}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter percentage"
                  required
                />
              </div>
              {/* Priority dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.priority ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  required
                >
                  {/* Placeholder option, styled light grey and italic */}
                  <option value="" disabled className="text-gray-400 italic">Select priority</option>
                  {priorityOptions.map(option => (
                    <option key={option} value={option} className="text-gray-100 not-italic">{option}</option>
                  ))}
                </select>
              </div>
              {/* Target Date field (date) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.targetDate ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>
              {/* Process Owner field (text) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Process Owner</label>
                <input
                  type="text"
                  value={formData.processOwner}
                  onChange={(e) => setFormData({ ...formData, processOwner: e.target.value })}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter process owner"
                  required
                />
              </div>
              {/* Review Date field (date) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Review Date</label>
                <input
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.reviewDate ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>
            </div>
            {/* Remarks/Mitigations field (textarea) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Remarks/Mitigations</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                placeholder="Enter remarks or mitigations"
                rows={3}
              />
            </div>
            {/* Form action buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-bold text-white bg-blue-700 rounded-lg shadow hover:bg-blue-800 transition-all"
              >
                {initialData ? 'Update Process' : 'Save Process'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 