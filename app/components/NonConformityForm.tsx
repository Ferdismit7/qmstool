'use client';

import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';



interface NonConformityFormData {
  id: number;
  business_area: string;
  sub_business_area: string;
  nc_number: string;
  nc_type: string;
  description: string;
  root_cause: string;
  corrective_action: string;
  responsible_person: string;
  target_date: string;
  completion_date: string;
  status: string;
  priority: string;
  impact_level: string;
  verification_method: string;
  effectiveness_review: string;
  lessons_learned: string;
  related_documents: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface NonConformityFormEditData {
  id: number;
  business_area: string;
  sub_business_area?: string;
  nc_number?: string;
  nc_type?: string;
  description?: string;
  root_cause?: string;
  corrective_action?: string;
  responsible_person?: string;
  target_date?: string;
  completion_date?: string;
  status?: string;
  priority?: string;
  impact_level?: string;
  verification_method?: string;
  effectiveness_review?: string;
  lessons_learned?: string;
  related_documents?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface NonConformityFormProps {
  onAdd: (nonConformity: NonConformityFormData) => void;
  onClose?: () => void;
  editData?: NonConformityFormEditData;
}

export default function NonConformityForm({ onAdd, onClose, editData }: NonConformityFormProps) {
  const [formData, setFormData] = useState({
    business_area: '',
    sub_business_area: '',
    nc_number: '',
    nc_type: '',
    description: '',
    root_cause: '',
    corrective_action: '',
    responsible_person: '',
    target_date: '',
    completion_date: '',
    status: '',
    priority: '',
    impact_level: '',
    verification_method: '',
    effectiveness_review: '',
    lessons_learned: '',
    related_documents: '',
  });

  const [fileData, setFileData] = useState<{
    file?: File;
    uploadedFile?: {
      key: string;
      url: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    };
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);

  useEffect(() => {
    if (editData) {
      setFormData(prev => ({
        ...prev,
        ...editData,
        target_date: editData.target_date ? new Date(editData.target_date).toISOString().split('T')[0] : '',
        completion_date: editData.completion_date ? new Date(editData.completion_date).toISOString().split('T')[0] : '',
      }));
    }
  }, [editData]);

  useEffect(() => {
    const fetchUserBusinessAreas = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/auth/user-business-areas', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserBusinessAreas(userData.businessAreas || []);
          
          // If creating a new non-conformity, pre-populate with user's first business area
          if (!editData && userData.businessAreas.length > 0) {
            setFormData(prev => ({ ...prev, business_area: userData.businessAreas[0] }));
          }
        } else {
          console.error('Failed to fetch user business areas:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user business areas:', error);
      }
    };

    fetchUserBusinessAreas();
  }, [editData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.business_area.trim()) newErrors.business_area = 'Business Area is required';
    if (!formData.sub_business_area.trim()) newErrors.sub_business_area = 'Sub Business Area is required';
    if (!formData.nc_number.trim()) newErrors.nc_number = 'NC Number is required';
    if (!formData.nc_type) newErrors.nc_type = 'NC Type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.root_cause.trim()) newErrors.root_cause = 'Root Cause is required';
    if (!formData.corrective_action.trim()) newErrors.corrective_action = 'Corrective Action is required';
    if (!formData.responsible_person.trim()) newErrors.responsible_person = 'Responsible Person is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.impact_level) newErrors.impact_level = 'Impact Level is required';
    if (!formData.target_date) newErrors.target_date = 'Target Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      if (data.success) {
        setFileData({
          uploadedFile: {
            key: data.key,
            url: data.url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({ ...prev, file: 'Failed to upload file' }));
    }
  };

  const handleFileRemove = () => {
    setFileData({});
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataWithDate = {
      id: editData?.id || 0,
      ...formData,
      target_date: formData.target_date || null,
      completion_date: formData.completion_date || null,
      // Add file data if uploaded
      ...(fileData.uploadedFile && {
        file_url: fileData.uploadedFile.key,
        file_name: fileData.uploadedFile.fileName,
        file_size: fileData.uploadedFile.fileSize,
        file_type: fileData.uploadedFile.fileType,
      }),
    } as NonConformityFormData;

    try {
      onAdd(dataWithDate);
      if (!editData) {
        setFormData({
          business_area: '',
          sub_business_area: '',
          nc_number: '',
          nc_type: '',
          description: '',
          root_cause: '',
          corrective_action: '',
          responsible_person: '',
          target_date: '',
          completion_date: '',
          status: '',
          priority: '',
          impact_level: '',
          verification_method: '',
          effectiveness_review: '',
          lessons_learned: '',
          related_documents: '',
        });
        setFileData({});
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save non-conformity. Please try again.'
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="business_area" className="block text-sm font-medium text-brand-gray3 mb-2">
            Business Area *
          </label>
          <select
            id="business_area"
            name="business_area"
            value={formData.business_area}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Business Area</option>
            {userBusinessAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          {errors.business_area && (
            <p className="mt-1 text-sm text-red-500">{errors.business_area}</p>
          )}
        </div>

        <div>
          <label htmlFor="sub_business_area" className="block text-sm font-medium text-brand-gray3 mb-2">
            Sub Business Area *
          </label>
          <input
            type="text"
            id="sub_business_area"
            name="sub_business_area"
            value={formData.sub_business_area}
            onChange={handleChange}
            placeholder="Enter sub business area"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.sub_business_area && (
            <p className="mt-1 text-sm text-red-500">{errors.sub_business_area}</p>
          )}
        </div>

        <div>
          <label htmlFor="nc_number" className="block text-sm font-medium text-brand-gray3 mb-2">
            NC Number *
          </label>
          <input
            type="text"
            id="nc_number"
            name="nc_number"
            value={formData.nc_number}
            onChange={handleChange}
            placeholder="Enter NC number"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.nc_number && (
            <p className="mt-1 text-sm text-red-500">{errors.nc_number}</p>
          )}
        </div>

        <div>
          <label htmlFor="nc_type" className="block text-sm font-medium text-brand-gray3 mb-2">
            NC Type *
          </label>
          <select
            id="nc_type"
            name="nc_type"
            value={formData.nc_type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select NC Type</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
            <option value="Critical">Critical</option>
            <option value="Opportunity">Opportunity</option>
          </select>
          {errors.nc_type && (
            <p className="mt-1 text-sm text-red-500">{errors.nc_type}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-brand-gray3 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Enter description"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="root_cause" className="block text-sm font-medium text-brand-gray3 mb-2">
            Root Cause *
          </label>
          <textarea
            id="root_cause"
            name="root_cause"
            value={formData.root_cause}
            onChange={handleChange}
            rows={3}
            placeholder="Enter root cause"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.root_cause && (
            <p className="mt-1 text-sm text-red-500">{errors.root_cause}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="corrective_action" className="block text-sm font-medium text-brand-gray3 mb-2">
            Corrective Action *
          </label>
          <textarea
            id="corrective_action"
            name="corrective_action"
            value={formData.corrective_action}
            onChange={handleChange}
            rows={3}
            placeholder="Enter corrective action"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.corrective_action && (
            <p className="mt-1 text-sm text-red-500">{errors.corrective_action}</p>
          )}
        </div>

        <div>
          <label htmlFor="responsible_person" className="block text-sm font-medium text-brand-gray3 mb-2">
            Responsible Person *
          </label>
          <input
            type="text"
            id="responsible_person"
            name="responsible_person"
            value={formData.responsible_person}
            onChange={handleChange}
            placeholder="Enter responsible person"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.responsible_person && (
            <p className="mt-1 text-sm text-red-500">{errors.responsible_person}</p>
          )}
        </div>

        <div>
          <label htmlFor="target_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Target Date *
          </label>
          <input
            type="date"
            id="target_date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.target_date && (
            <p className="mt-1 text-sm text-red-500">{errors.target_date}</p>
          )}
        </div>

        <div>
          <label htmlFor="completion_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Completion Date
          </label>
          <input
            type="date"
            id="completion_date"
            name="completion_date"
            value={formData.completion_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-brand-gray3 mb-2">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Closed">Closed</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-brand-gray3 mb-2">
            Priority *
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
          )}
        </div>

        <div>
          <label htmlFor="impact_level" className="block text-sm font-medium text-brand-gray3 mb-2">
            Impact Level *
          </label>
          <select
            id="impact_level"
            name="impact_level"
            value={formData.impact_level}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Impact Level</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {errors.impact_level && (
            <p className="mt-1 text-sm text-red-500">{errors.impact_level}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="verification_method" className="block text-sm font-medium text-brand-gray3 mb-2">
            Verification Method
          </label>
          <textarea
            id="verification_method"
            name="verification_method"
            value={formData.verification_method}
            onChange={handleChange}
            rows={3}
            placeholder="Enter verification method"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="effectiveness_review" className="block text-sm font-medium text-brand-gray3 mb-2">
            Effectiveness Review
          </label>
          <textarea
            id="effectiveness_review"
            name="effectiveness_review"
            value={formData.effectiveness_review}
            onChange={handleChange}
            rows={3}
            placeholder="Enter effectiveness review"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="lessons_learned" className="block text-sm font-medium text-brand-gray3 mb-2">
            Lessons Learned
          </label>
          <textarea
            id="lessons_learned"
            name="lessons_learned"
            value={formData.lessons_learned}
            onChange={handleChange}
            rows={3}
            placeholder="Enter lessons learned"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="related_documents" className="block text-sm font-medium text-brand-gray3 mb-2">
            Related Documents
          </label>
          <textarea
            id="related_documents"
            name="related_documents"
            value={formData.related_documents}
            onChange={handleChange}
            rows={3}
            placeholder="Enter related documents"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <FileUpload
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            currentFile={fileData.uploadedFile ? {
              name: fileData.uploadedFile.fileName,
              size: fileData.uploadedFile.fileSize,
              url: fileData.uploadedFile.url
            } : undefined}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            maxSize={10 * 1024 * 1024} // 10MB
            label="Upload Supporting Document"
          />
          {errors.file && (
            <p className="mt-1 text-sm text-red-500">{errors.file}</p>
          )}
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
          {editData ? 'Update Non-Conformity' : 'Add Non-Conformity'}
        </button>
      </div>
    </form>
  );
}
