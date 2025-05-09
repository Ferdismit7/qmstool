'use client';

import { useState } from 'react';

interface BusinessProcessFormProps {
  onAdd: (process: any) => void;
}

export default function BusinessProcessForm({ onAdd }: BusinessProcessFormProps) {
  const [formData, setFormData] = useState({
    businessArea: '',
    subBusinessArea: '',
    processName: '',
    documentName: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    // Reset form
    setFormData({
      businessArea: '',
      subBusinessArea: '',
      processName: '',
      documentName: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'statusPercentage' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Area</label>
          <input
            type="text"
            name="businessArea"
            value={formData.businessArea}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sub Business Area</label>
          <input
            type="text"
            name="subBusinessArea"
            value={formData.subBusinessArea}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Process Name</label>
          <input
            type="text"
            name="processName"
            value={formData.processName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Document Name</label>
          <input
            type="text"
            name="documentName"
            value={formData.documentName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Version</label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Progress</label>
          <input
            type="text"
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status %</label>
          <input
            type="number"
            name="statusPercentage"
            value={formData.statusPercentage}
            onChange={handleChange}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Date</label>
          <input
            type="date"
            name="targetDate"
            value={formData.targetDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Process Owner</label>
          <input
            type="text"
            name="processOwner"
            value={formData.processOwner}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Remarks</label>
          <input
            type="text"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Review Date</label>
          <input
            type="date"
            name="reviewDate"
            value={formData.reviewDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Process
        </button>
      </div>
    </form>
  );
} 