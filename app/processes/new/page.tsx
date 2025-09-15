'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import FileUploadField from '../../components/FileUploadField';

export default function NewBusinessProcessPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    businessArea: '',
    subBusinessArea: '',
    processName: '',
    documentName: '',
    version: '',
    progress: '',
    docStatus: '',
    statusPercentage: '',
    priority: '',
    targetDate: '',
    processOwner: '',
    remarks: '',
    reviewDate: '',
    fileUrl: '',
    fileName: '',
    fileSize: '',
    fileType: ''
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
              businessArea: userData.businessAreas[0]
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
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/business-processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create process');
      }

      const newProcess = await response.json();
      
      // Redirect to the new process detail page
      router.push(`/processes/${newProcess.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create process');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/processes"
            className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Business Processes
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Add New Business Process</h1>
        <p className="text-brand-gray3 mt-1">Create a new business process</p>
      </div>

      {/* New Process Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Area */}
            <div>
              <label htmlFor="businessArea" className="block text-sm font-medium text-brand-gray3 mb-2">
                Business Area
              </label>
              <select
                id="businessArea"
                name="businessArea"
                value={formData.businessArea}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Select Business Area</option>
                {userBusinessAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Sub Business Area */}
            <div>
              <label htmlFor="subBusinessArea" className="block text-sm font-medium text-brand-gray3 mb-2">
                Sub Business Area
              </label>
              <input
                type="text"
                id="subBusinessArea"
                name="subBusinessArea"
                value={formData.subBusinessArea}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Process Name */}
            <div>
              <label htmlFor="processName" className="block text-sm font-medium text-brand-gray3 mb-2">
                Process Name *
              </label>
              <input
                type="text"
                id="processName"
                name="processName"
                value={formData.processName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Document Name */}
            <div>
              <label htmlFor="documentName" className="block text-sm font-medium text-brand-gray3 mb-2">
                Document Name
              </label>
              <input
                type="text"
                id="documentName"
                name="documentName"
                value={formData.documentName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Version */}
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-brand-gray3 mb-2">
                Version
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-brand-gray3 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Progress */}
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-brand-gray3 mb-2">
                Progress
              </label>
              <select
                id="progress"
                name="progress"
                value={formData.progress}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Progress</option>
                <option value="Not Started">Not Started</option>
                <option value="On-Track">On-Track</option>
                <option value="Completed">Completed</option>
                <option value="Minor Challenges">Minor Challenges</option>
                <option value="Major Challenges">Major Challenges</option>
              </select>
            </div>

            {/* Document Status */}
            <div>
              <label htmlFor="docStatus" className="block text-sm font-medium text-brand-gray3 mb-2">
                Document Status
              </label>
              <select
                id="docStatus"
                name="docStatus"
                value={formData.docStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="To be reviewed">To be reviewed</option>
                <option value="In progress">In progress</option>
                <option value="New">New</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Status Percentage */}
            <div>
              <label htmlFor="statusPercentage" className="block text-sm font-medium text-brand-gray3 mb-2">
                Status Percentage
              </label>
              <input
                type="number"
                id="statusPercentage"
                name="statusPercentage"
                value={formData.statusPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Process Owner */}
            <div>
              <label htmlFor="processOwner" className="block text-sm font-medium text-brand-gray3 mb-2">
                Process Owner
              </label>
              <input
                type="text"
                id="processOwner"
                name="processOwner"
                value={formData.processOwner}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Target Date */}
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-brand-gray3 mb-2">
                Target Date
              </label>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Review Date */}
            <div>
              <label htmlFor="reviewDate" className="block text-sm font-medium text-brand-gray3 mb-2">
                Review Date
              </label>
              <input
                type="date"
                id="reviewDate"
                name="reviewDate"
                value={formData.reviewDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-brand-gray3 mb-2">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* File Upload Section */}
          <div className="mt-6">
            <FileUploadField
              label="Upload Document"
              value={{
                file_url: formData.fileUrl,
                file_name: formData.fileName,
                file_size: formData.fileSize ? Number(formData.fileSize) : undefined,
                file_type: formData.fileType,
              }}
              onChange={(fileData) => {
                setFormData(prev => ({
                  ...prev,
                  fileUrl: fileData.file_url || '',
                  fileName: fileData.file_name || '',
                  fileSize: fileData.file_size?.toString() || '',
                  fileType: fileData.file_type || '',
                }));
              }}
              onRemove={() => {
                setFormData(prev => ({
                  ...prev,
                  fileUrl: '',
                  fileName: '',
                  fileSize: '',
                  fileType: '',
                }));
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
              maxSize={10}
              businessArea={formData.businessArea}
              documentType="business-processes"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave size={16} />
              {isSaving ? 'Creating...' : 'Create Process'}
            </button>
            <Link
              href="/processes"
              className="px-4 py-2 text-brand-gray3 hover:text-brand-white transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 