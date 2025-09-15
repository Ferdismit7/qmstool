'use client';

import { useState, useEffect } from 'react';
import FileUploadField from './FileUploadField';



interface RecordKeepingSystemFormData {
  id: number;
  business_area: string;
  sub_business_area: string;
  record_type: string;
  system_name: string;
  system_description: string;
  retention_period: string;
  storage_location: string;
  access_controls: string;
  backup_procedures: string;
  disposal_procedures: string;
  compliance_status: string;
  last_audit_date: string;
  next_audit_date: string;
  audit_findings: string;
  corrective_actions: string;
  responsible_person: string;
  status_percentage: number;
  doc_status: string;
  progress: string;
  notes: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface RecordKeepingSystemFormEditData {
  id: number;
  business_area: string;
  sub_business_area?: string;
  record_type?: string;
  system_name?: string;
  system_description?: string;
  retention_period?: string;
  storage_location?: string;
  access_controls?: string;
  backup_procedures?: string;
  disposal_procedures?: string;
  compliance_status?: string;
  last_audit_date?: string;
  next_audit_date?: string;
  audit_findings?: string;
  corrective_actions?: string;
  responsible_person?: string;
  status_percentage?: number;
  doc_status?: string;
  progress?: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface RecordKeepingSystemFormProps {
  onAdd: (recordKeepingSystem: RecordKeepingSystemFormData) => void;
  onClose?: () => void;
  editData?: RecordKeepingSystemFormEditData;
}

export default function RecordKeepingSystemForm({ onAdd, onClose, editData }: RecordKeepingSystemFormProps) {
  const [formData, setFormData] = useState({
    business_area: '',
    sub_business_area: '',
    record_type: '',
    system_name: '',
    system_description: '',
    retention_period: '',
    storage_location: '',
    access_controls: '',
    backup_procedures: '',
    disposal_procedures: '',
    compliance_status: '',
    last_audit_date: '',
    next_audit_date: '',
    audit_findings: '',
    corrective_actions: '',
    responsible_person: '',
    status_percentage: 0,
    doc_status: '',
    progress: '',
    notes: '',
  });

  const [fileData, setFileData] = useState<{
    file_url?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);

  useEffect(() => {
    if (editData) {
      setFormData(prev => ({
        ...prev,
        ...editData,
        last_audit_date: editData.last_audit_date ? new Date(editData.last_audit_date).toISOString().split('T')[0] : '',
        next_audit_date: editData.next_audit_date ? new Date(editData.next_audit_date).toISOString().split('T')[0] : '',
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
          
          // If creating a new record keeping system, pre-populate with user's first business area
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
    if (!formData.record_type) newErrors.record_type = 'Record Type is required';
    if (!formData.system_name.trim()) newErrors.system_name = 'System Name is required';
    if (!formData.system_description.trim()) newErrors.system_description = 'System Description is required';
    if (!formData.retention_period.trim()) newErrors.retention_period = 'Retention Period is required';
    if (!formData.storage_location.trim()) newErrors.storage_location = 'Storage Location is required';
    if (!formData.access_controls.trim()) newErrors.access_controls = 'Access Controls is required';
    if (!formData.backup_procedures.trim()) newErrors.backup_procedures = 'Backup Procedures is required';
    if (!formData.disposal_procedures.trim()) newErrors.disposal_procedures = 'Disposal Procedures is required';
    if (!formData.compliance_status) newErrors.compliance_status = 'Compliance Status is required';
    if (!formData.responsible_person.trim()) newErrors.responsible_person = 'Responsible Person is required';
    if (!formData.doc_status) newErrors.doc_status = 'Status is required';
    if (!formData.progress) newErrors.progress = 'Progress is required';
    if (formData.status_percentage < 0 || formData.status_percentage > 100) {
      newErrors.status_percentage = 'Status percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // File upload is now handled by the FileUploadField component

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataWithDate = {
      id: editData?.id || 0,
      ...formData,
      last_audit_date: formData.last_audit_date || null,
      next_audit_date: formData.next_audit_date || null,
      // Add file data if uploaded
      ...(fileData.file_url && {
        file_url: fileData.file_url,
        file_name: fileData.file_name,
        file_size: fileData.file_size,
        file_type: fileData.file_type,
      }),
    } as RecordKeepingSystemFormData;

    try {
      onAdd(dataWithDate);
      if (!editData) {
        setFormData({
          business_area: '',
          sub_business_area: '',
          record_type: '',
          system_name: '',
          system_description: '',
          retention_period: '',
          storage_location: '',
          access_controls: '',
          backup_procedures: '',
          disposal_procedures: '',
          compliance_status: '',
          last_audit_date: '',
          next_audit_date: '',
          audit_findings: '',
          corrective_actions: '',
          responsible_person: '',
          status_percentage: 0,
          doc_status: '',
          progress: '',
          notes: '',
        });
        setFileData({});
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save record keeping system. Please try again.'
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status_percentage' ? Math.floor(parseInt(value) || 0) : value,
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
          <label htmlFor="record_type" className="block text-sm font-medium text-brand-gray3 mb-2">
            Record Type *
          </label>
          <select
            id="record_type"
            name="record_type"
            value={formData.record_type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Record Type</option>
            <option value="Quality Records">Quality Records</option>
            <option value="Management Records">Management Records</option>
            <option value="Operational Records">Operational Records</option>
            <option value="Financial Records">Financial Records</option>
            <option value="HR Records">HR Records</option>
            <option value="Legal Records">Legal Records</option>
            <option value="Other">Other</option>
          </select>
          {errors.record_type && (
            <p className="mt-1 text-sm text-red-500">{errors.record_type}</p>
          )}
        </div>

        <div>
          <label htmlFor="system_name" className="block text-sm font-medium text-brand-gray3 mb-2">
            System Name *
          </label>
          <input
            type="text"
            id="system_name"
            name="system_name"
            value={formData.system_name}
            onChange={handleChange}
            placeholder="Enter system name"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.system_name && (
            <p className="mt-1 text-sm text-red-500">{errors.system_name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="system_description" className="block text-sm font-medium text-brand-gray3 mb-2">
            System Description *
          </label>
          <textarea
            id="system_description"
            name="system_description"
            value={formData.system_description}
            onChange={handleChange}
            rows={3}
            placeholder="Enter system description"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.system_description && (
            <p className="mt-1 text-sm text-red-500">{errors.system_description}</p>
          )}
        </div>

        <div>
          <label htmlFor="retention_period" className="block text-sm font-medium text-brand-gray3 mb-2">
            Retention Period *
          </label>
          <input
            type="text"
            id="retention_period"
            name="retention_period"
            value={formData.retention_period}
            onChange={handleChange}
            placeholder="e.g., 7 years, 10 years"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.retention_period && (
            <p className="mt-1 text-sm text-red-500">{errors.retention_period}</p>
          )}
        </div>

        <div>
          <label htmlFor="storage_location" className="block text-sm font-medium text-brand-gray3 mb-2">
            Storage Location *
          </label>
          <input
            type="text"
            id="storage_location"
            name="storage_location"
            value={formData.storage_location}
            onChange={handleChange}
            placeholder="Enter storage location"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.storage_location && (
            <p className="mt-1 text-sm text-red-500">{errors.storage_location}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="access_controls" className="block text-sm font-medium text-brand-gray3 mb-2">
            Access Controls *
          </label>
          <textarea
            id="access_controls"
            name="access_controls"
            value={formData.access_controls}
            onChange={handleChange}
            rows={3}
            placeholder="Describe access controls"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.access_controls && (
            <p className="mt-1 text-sm text-red-500">{errors.access_controls}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="backup_procedures" className="block text-sm font-medium text-brand-gray3 mb-2">
            Backup Procedures *
          </label>
          <textarea
            id="backup_procedures"
            name="backup_procedures"
            value={formData.backup_procedures}
            onChange={handleChange}
            rows={3}
            placeholder="Describe backup procedures"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.backup_procedures && (
            <p className="mt-1 text-sm text-red-500">{errors.backup_procedures}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="disposal_procedures" className="block text-sm font-medium text-brand-gray3 mb-2">
            Disposal Procedures *
          </label>
          <textarea
            id="disposal_procedures"
            name="disposal_procedures"
            value={formData.disposal_procedures}
            onChange={handleChange}
            rows={3}
            placeholder="Describe disposal procedures"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.disposal_procedures && (
            <p className="mt-1 text-sm text-red-500">{errors.disposal_procedures}</p>
          )}
        </div>

        <div>
          <label htmlFor="compliance_status" className="block text-sm font-medium text-brand-gray3 mb-2">
            Compliance Status *
          </label>
          <select
            id="compliance_status"
            name="compliance_status"
            value={formData.compliance_status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Compliance Status</option>
            <option value="Compliant">Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
          {errors.compliance_status && (
            <p className="mt-1 text-sm text-red-500">{errors.compliance_status}</p>
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
          <label htmlFor="last_audit_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Last Audit Date
          </label>
          <input
            type="date"
            id="last_audit_date"
            name="last_audit_date"
            value={formData.last_audit_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="next_audit_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Next Audit Date
          </label>
          <input
            type="date"
            id="next_audit_date"
            name="next_audit_date"
            value={formData.next_audit_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="doc_status" className="block text-sm font-medium text-brand-gray3 mb-2">
            Status *
          </label>
          <select
            id="doc_status"
            name="doc_status"
            value={formData.doc_status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Status</option>
            <option value="On-Track">On-Track</option>
            <option value="Completed">Completed</option>
            <option value="Minor Challenges">Minor Challenges</option>
            <option value="Major Challenges">Major Challenges</option>
            <option value="Not Started">Not Started</option>
          </select>
          {errors.doc_status && (
            <p className="mt-1 text-sm text-red-500">{errors.doc_status}</p>
          )}
        </div>

        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-brand-gray3 mb-2">
            Progress *
          </label>
          <select
            id="progress"
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Progress</option>
            <option value="Completed">Completed</option>
            <option value="In progress">In progress</option>
            <option value="To be reviewed">To be reviewed</option>
            <option value="New">New</option>
          </select>
          {errors.progress && (
            <p className="mt-1 text-sm text-red-500">{errors.progress}</p>
          )}
        </div>

        <div>
          <label htmlFor="status_percentage" className="block text-sm font-medium text-brand-gray3 mb-2">
            Status Percentage *
          </label>
          <input
            type="number"
            id="status_percentage"
            name="status_percentage"
            value={formData.status_percentage}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.status_percentage && (
            <p className="mt-1 text-sm text-red-500">{errors.status_percentage}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="audit_findings" className="block text-sm font-medium text-brand-gray3 mb-2">
            Audit Findings
          </label>
          <textarea
            id="audit_findings"
            name="audit_findings"
            value={formData.audit_findings}
            onChange={handleChange}
            rows={3}
            placeholder="Enter audit findings"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="corrective_actions" className="block text-sm font-medium text-brand-gray3 mb-2">
            Corrective Actions
          </label>
          <textarea
            id="corrective_actions"
            name="corrective_actions"
            value={formData.corrective_actions}
            onChange={handleChange}
            rows={3}
            placeholder="Enter corrective actions"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-brand-gray3 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Enter additional notes"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <FileUploadField
            label="Upload Supporting Document"
            value={{
              file_url: fileData.file_url,
              file_name: fileData.file_name,
              file_size: fileData.file_size,
              file_type: fileData.file_type,
            }}
            onChange={(fileData) => {
              setFileData(prev => ({
                ...prev,
                ...fileData
              }));
            }}
            onRemove={() => {
              setFileData(prev => ({
                ...prev,
                file_url: undefined,
                file_name: undefined,
                file_size: undefined,
                file_type: undefined,
              }));
            }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            maxSize={10}
            businessArea={formData.business_area}
            documentType="record-keeping-systems"
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
          {editData ? 'Update Record Keeping System' : 'Add Record Keeping System'}
        </button>
      </div>
    </form>
  );
}
