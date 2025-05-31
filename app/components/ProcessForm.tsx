'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { BusinessProcessRegister, BusinessProcessRegisterInput } from '../lib/types/businessProcess';
import { DOC_STATUS, PROGRESS_STATUS, PRIORITY } from '../lib/types/businessProcess';

// Props for the ProcessForm component
interface ProcessFormProps {
  process?: BusinessProcessRegister;
  onSubmit: (data: BusinessProcessRegisterInput) => Promise<void>;
  onCancel: () => void;
}

// Initial state for a new process form
const initialFormState: BusinessProcessRegisterInput = {
  businessArea: '',
  subBusinessArea: '',
  processName: '',
  documentName: '',
  version: '',
  progress: PROGRESS_STATUS.ON_TRACK,
  docStatus: DOC_STATUS.NEW,
  statusPrecentage: 0,
  priority: PRIORITY.MEDIUM,
  targetDate: new Date(),
  processOwner: '',
  updateDate: new Date(),
  remarks: '',
  reviewDate: new Date(),
};

// Dropdown options for progress, status, and priority
const progressOptions = Object.values(PROGRESS_STATUS);
const statusOptions = Object.values(DOC_STATUS);
const priorityOptions = Object.values(PRIORITY);

// Helper to safely format date for input
const getDateInputValue = (date: string | Date | null | undefined) => {
  if (!date) return '';
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse and format
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return '';
  }
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return '';
};

/**
 * ProcessForm component renders a modal form for adding or editing a business process.
 * - When opened for adding, all fields are blank/default.
 * - When opened for editing, fields are pre-filled with the selected process data.
 * - Dropdowns and date fields have styled placeholders for clarity.
 */
export default function ProcessForm({ process, onSubmit, onCancel }: ProcessFormProps) {
  // State for form data
  const [formData, setFormData] = useState<BusinessProcessRegisterInput>(initialFormState);

  // Effect: Reset form data when modal is opened or when editing a process
  useEffect(() => {
    if (process) {
      setFormData({
        businessArea: process.businessArea || '',
        subBusinessArea: process.subBusinessArea || '',
        processName: process.processName || '',
        documentName: process.documentName || '',
        version: process.version || '',
        progress: process.progress || PROGRESS_STATUS.ON_TRACK,
        docStatus: process.docStatus || DOC_STATUS.NEW,
        statusPrecentage: Number(process.statusPrecentage) || 0,
        priority: process.priority || PRIORITY.MEDIUM,
        targetDate: process.targetDate ? new Date(process.targetDate) : new Date(),
        processOwner: process.processOwner || '',
        updateDate: new Date(),
        remarks: process.remarks || '',
        reviewDate: process.reviewDate ? new Date(process.reviewDate) : new Date(),
      });
    } else {
      setFormData(initialFormState);
    }
  }, [process]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData: BusinessProcessRegisterInput = {
      businessArea: formData.businessArea || '',
      subBusinessArea: formData.subBusinessArea || '',
      processName: formData.processName || '',
      documentName: formData.documentName || '',
      version: formData.version || '',
      progress: formData.progress || PROGRESS_STATUS.ON_TRACK,
      docStatus: formData.docStatus || DOC_STATUS.NEW,
      statusPrecentage: Number(formData.statusPrecentage) || 0,
      priority: formData.priority || PRIORITY.MEDIUM,
      targetDate: formData.targetDate instanceof Date ? formData.targetDate : new Date(formData.targetDate),
      processOwner: formData.processOwner || '',
      updateDate: new Date(),
      remarks: formData.remarks || '',
      reviewDate: formData.reviewDate instanceof Date ? formData.reviewDate : new Date(formData.reviewDate),
    };
    await onSubmit(submissionData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'statusPrecentage' ? parseFloat(value) : 
              name.includes('Date') ? new Date(value) : 
              value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal container with dark gradient and rounded corners */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-8">
          {/* Modal header with title and close button */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-100">
              {process ? 'Edit Process' : 'Add New Process'}
            </h2>
            <button
              onClick={onCancel}
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
                <label htmlFor="businessArea" className="block text-sm font-medium text-gray-300 mb-1">Business Area</label>
                <input
                  id="businessArea"
                  name="businessArea"
                  type="text"
                  value={formData.businessArea}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter business area"
                  required
                />
              </div>
              {/* Sub Business Area field (text) */}
              <div>
                <label htmlFor="subBusinessArea" className="block text-sm font-medium text-gray-300 mb-1">Sub Business Area</label>
                <input
                  id="subBusinessArea"
                  name="subBusinessArea"
                  type="text"
                  value={formData.subBusinessArea}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter sub business area"
                  required
                />
              </div>
              {/* Process Name field (text) */}
              <div>
                <label htmlFor="processName" className="block text-sm font-medium text-gray-300 mb-1">Process Name</label>
                <input
                  id="processName"
                  name="processName"
                  type="text"
                  value={formData.processName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter process name"
                  required
                />
              </div>
              {/* Document Name field (text) */}
              <div>
                <label htmlFor="documentName" className="block text-sm font-medium text-gray-300 mb-1">Document Name</label>
                <input
                  id="documentName"
                  name="documentName"
                  type="text"
                  value={formData.documentName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter document name"
                  required
                />
              </div>
              {/* Version field (text) */}
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-1">Version</label>
                <input
                  id="version"
                  name="version"
                  type="text"
                  value={formData.version}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter version"
                  required
                />
              </div>
              {/* Progress dropdown */}
              <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-300 mb-1">Progress</label>
                <select
                  id="progress"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
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
                <label htmlFor="docStatus" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  id="docStatus"
                  name="docStatus"
                  value={formData.docStatus}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.docStatus ? 'text-gray-400 italic' : 'text-gray-100'}`}
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
                <label htmlFor="statusPrecentage" className="block text-sm font-medium text-gray-300 mb-1">Status Percentage (%)</label>
                <input
                  id="statusPrecentage"
                  name="statusPrecentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.statusPrecentage}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter percentage"
                  required
                />
              </div>
              {/* Priority dropdown */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.priority ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  required
                >
                  <option value="" disabled className="text-gray-400 italic">Select priority</option>
                  {priorityOptions.map(option => (
                    <option key={option} value={option} className="text-gray-100 not-italic">{option}</option>
                  ))}
                </select>
              </div>
              {/* Target Date field (date) */}
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-300 mb-1">Target Date</label>
                <input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={getDateInputValue(formData.targetDate)}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.targetDate ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>
              {/* Process Owner field (text) */}
              <div>
                <label htmlFor="processOwner" className="block text-sm font-medium text-gray-300 mb-1">Process Owner</label>
                <input
                  id="processOwner"
                  name="processOwner"
                  type="text"
                  value={formData.processOwner}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                  placeholder="Enter process owner"
                  required
                />
              </div>
              {/* Review Date field (date) */}
              <div>
                <label htmlFor="reviewDate" className="block text-sm font-medium text-gray-300 mb-1">Review Date</label>
                <input
                  id="reviewDate"
                  name="reviewDate"
                  type="date"
                  value={getDateInputValue(formData.reviewDate)}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.reviewDate ? 'text-gray-400 italic' : 'text-gray-100'}`}
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>
            </div>
            {/* Remarks/Mitigations field (textarea) */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-300 mb-1">Remarks/Mitigations</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 italic"
                placeholder="Enter remarks or mitigations"
                rows={3}
              />
            </div>
            {/* Form action buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-bold text-white bg-blue-700 rounded-lg shadow hover:bg-blue-800 transition-all"
              >
                {process ? 'Update Process' : 'Save Process'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 