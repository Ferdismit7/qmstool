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
    businessArea: editData?.businessArea || '',
    subBusinessArea: editData?.subBusinessArea || '',
    nameAndNumbering: editData?.nameAndNumbering || '',
    documentName: editData?.documentName || '',
    documentType: editData?.documentType || '',
    version: editData?.version || '',
    progress: editData?.progress || '',
    status: editData?.status || '',
    statusPercentage: editData?.statusPercentage || 0,
    priority: editData?.priority || 'Low',
    targetDate: editData?.targetDate ? new Date(editData.targetDate).toISOString().split('T')[0] : '',
    processOwner: editData?.documentOwner || '',
    remarks: editData?.remarks || '',
    reviewDate: editData?.reviewDate ? new Date(editData.reviewDate).toISOString().split('T')[0] : '',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        businessArea: editData.businessArea || '',
        subBusinessArea: editData.subBusinessArea || '',
        nameAndNumbering: editData.nameAndNumbering || '',
        documentName: editData.documentName || '',
        documentType: editData.documentType || '',
        version: editData.version || '',
        progress: editData.progress || '',
        status: editData.status || '',
        statusPercentage: editData.statusPercentage || 0,
        priority: editData.priority || 'Low',
        targetDate: editData.targetDate ? new Date(editData.targetDate).toISOString().split('T')[0] : '',
        processOwner: editData.documentOwner || '',
        remarks: editData.remarks || '',
        reviewDate: editData.reviewDate ? new Date(editData.reviewDate).toISOString().split('T')[0] : '',
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataWithDate = {
      id: editData?.id || crypto.randomUUID(),
      businessArea: formData.businessArea,
      subBusinessArea: formData.subBusinessArea,
      nameAndNumbering: formData.nameAndNumbering,
      documentName: formData.documentName,
      documentType: formData.documentType,
      version: formData.version,
      progress: formData.progress,
      status: formData.status,
      statusPercentage: parseInt(formData.statusPercentage.toString(), 10),
      priority: formData.priority,
      targetDate: formData.targetDate,
      documentOwner: formData.processOwner,
      updateDate: new Date().toISOString().split('T')[0],
      remarks: formData.remarks || null,
      reviewDate: formData.reviewDate || null
    };
    console.log('Submitting form data:', dataWithDate);
    onAdd(dataWithDate);
    setFormData({
      businessArea: '',
      subBusinessArea: '',
      nameAndNumbering: '',
      documentName: '',
      documentType: '',
      version: '',
      progress: '',
      status: '',
      statusPercentage: 0,
      priority: 'Low',
      targetDate: '',
      processOwner: '',
      remarks: '',
      reviewDate: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'statusPercentage' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Business Area</label>
          <input
            type="text"
            name="businessArea"
            value={formData.businessArea}
            onChange={handleChange}
            placeholder="Enter business area"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Sub Business Area</label>
          <input
            type="text"
            name="subBusinessArea"
            value={formData.subBusinessArea}
            onChange={handleChange}
            placeholder="Enter sub business area"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Name and Numbering</label>
          <input
            type="text"
            name="nameAndNumbering"
            value={formData.nameAndNumbering}
            onChange={handleChange}
            placeholder="Enter name and numbering"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Document Name</label>
          <input
            type="text"
            name="documentName"
            value={formData.documentName}
            onChange={handleChange}
            placeholder="Enter document name"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Document Type</label>
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select document type</option>
            <option value="SOP">SOP</option>
            <option value="BP">BP</option>
            <option value="Policy">Policy</option>
            <option value="Form">Form</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Version</label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="Enter version"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Progress</label>
          <select
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select progress</option>
            <option value="Completed">Completed</option>
            <option value="On-Track">On-Track</option>
            <option value="Minor Challenges">Minor Challenges</option>
            <option value="Major Challenges">Major Challenges</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select status</option>
            <option value="New">New</option>
            <option value="In progress">In progress</option>
            <option value="To be reviewed">To be reviewed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Status Percentage (%)</label>
          <input
            type="number"
            name="statusPercentage"
            value={formData.statusPercentage}
            onChange={handleChange}
            placeholder="Enter percentage"
            min="0"
            max="100"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Target Date</label>
          <input
            type="date"
            name="targetDate"
            value={formData.targetDate}
            onChange={handleChange}
            placeholder="dd/mm/yyyy"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Process Owner</label>
          <input
            type="text"
            name="processOwner"
            value={formData.processOwner}
            onChange={handleChange}
            placeholder="Enter process owner"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-white mb-1">Review Date</label>
          <input
            type="date"
            name="reviewDate"
            value={formData.reviewDate}
            onChange={handleChange}
            placeholder="dd/mm/yyyy"
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-semibold text-brand-white mb-1">Remarks/Mitigations</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter remarks or mitigations"
            rows={3}
            className="w-full rounded-md border border-brand-gray2 bg-brand-dark/60 text-brand-white placeholder-brand-gray3 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          className="bg-brand-gray2 text-brand-white px-6 py-2 rounded-md hover:bg-brand-gray3 focus:outline-none focus:ring-2 focus:ring-brand-gray2 focus:ring-offset-2"
          onClick={() => {
            if (onClose) {
              onClose();
            }
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-2 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Process
        </button>
      </div>
    </form>
  );
} 