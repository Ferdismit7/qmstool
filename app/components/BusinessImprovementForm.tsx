'use client';

import { useState, useEffect } from 'react';
import FileUploadField from './FileUploadField';



interface BusinessImprovementFormData {
  id: number;
  business_area: string;
  sub_business_area: string;
  improvement_title: string;
  improvement_type: string;
  description: string;
  business_case: string;
  expected_benefits: string;
  implementation_plan: string;
  success_criteria: string;
  responsible_person: string;
  start_date: string;
  target_completion_date: string;
  actual_completion_date: string;
  status: string;
  priority: string;
  budget_allocated: number;
  actual_cost: number;
  roi_calculation: string;
  lessons_learned: string;
  next_steps: string;
  related_processes: string;
  status_percentage: number;
  doc_status: string;
  progress: string;
  notes: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface BusinessImprovementFormEditData {
  id: number;
  business_area: string;
  sub_business_area?: string;
  improvement_title?: string;
  improvement_type?: string;
  description?: string;
  business_case?: string;
  expected_benefits?: string;
  implementation_plan?: string;
  success_criteria?: string;
  responsible_person?: string;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  status?: string;
  priority?: string;
  budget_allocated?: number;
  actual_cost?: number;
  roi_calculation?: string;
  lessons_learned?: string;
  next_steps?: string;
  related_processes?: string;
  status_percentage?: number;
  doc_status?: string;
  progress?: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface BusinessImprovementFormProps {
  onAdd: (businessImprovement: BusinessImprovementFormData) => void;
  onClose?: () => void;
  editData?: BusinessImprovementFormEditData;
}

export default function BusinessImprovementForm({ onAdd, onClose, editData }: BusinessImprovementFormProps) {
  const [formData, setFormData] = useState({
    business_area: '',
    sub_business_area: '',
    improvement_title: '',
    improvement_type: '',
    description: '',
    business_case: '',
    expected_benefits: '',
    implementation_plan: '',
    success_criteria: '',
    responsible_person: '',
    start_date: '',
    target_completion_date: '',
    actual_completion_date: '',
    status: '',
    priority: '',
    budget_allocated: 0,
    actual_cost: 0,
    roi_calculation: '',
    lessons_learned: '',
    next_steps: '',
    related_processes: '',
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
        start_date: editData.start_date ? new Date(editData.start_date).toISOString().split('T')[0] : '',
        target_completion_date: editData.target_completion_date ? new Date(editData.target_completion_date).toISOString().split('T')[0] : '',
        actual_completion_date: editData.actual_completion_date ? new Date(editData.actual_completion_date).toISOString().split('T')[0] : '',
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
          
          // If creating a new business improvement, pre-populate with user's first business area
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
    if (!formData.improvement_title.trim()) newErrors.improvement_title = 'Improvement Title is required';
    if (!formData.improvement_type) newErrors.improvement_type = 'Improvement Type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.business_case.trim()) newErrors.business_case = 'Business Case is required';
    if (!formData.expected_benefits.trim()) newErrors.expected_benefits = 'Expected Benefits is required';
    if (!formData.implementation_plan.trim()) newErrors.implementation_plan = 'Implementation Plan is required';
    if (!formData.success_criteria.trim()) newErrors.success_criteria = 'Success Criteria is required';
    if (!formData.responsible_person.trim()) newErrors.responsible_person = 'Responsible Person is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
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
      start_date: formData.start_date || null,
      target_completion_date: formData.target_completion_date || null,
      actual_completion_date: formData.actual_completion_date || null,
      ...(fileData.file_url && {
        file_url: fileData.file_url,
        file_name: fileData.file_name,
        file_size: fileData.file_size,
        file_type: fileData.file_type,
      }),
    } as BusinessImprovementFormData;

    try {
      onAdd(dataWithDate);
      if (!editData) {
        setFormData({
          business_area: '',
          sub_business_area: '',
          improvement_title: '',
          improvement_type: '',
          description: '',
          business_case: '',
          expected_benefits: '',
          implementation_plan: '',
          success_criteria: '',
          responsible_person: '',
          start_date: '',
          target_completion_date: '',
          actual_completion_date: '',
          status: '',
          priority: '',
          budget_allocated: 0,
          actual_cost: 0,
          roi_calculation: '',
          lessons_learned: '',
          next_steps: '',
          related_processes: '',
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
        submit: 'Failed to save business improvement. Please try again.'
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['status_percentage', 'budget_allocated', 'actual_cost'].includes(name) 
        ? Math.floor(parseFloat(value) || 0) 
        : value,
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
          <label htmlFor="improvement_title" className="block text-sm font-medium text-brand-gray3 mb-2">
            Improvement Title *
          </label>
          <input
            type="text"
            id="improvement_title"
            name="improvement_title"
            value={formData.improvement_title}
            onChange={handleChange}
            placeholder="Enter improvement title"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.improvement_title && (
            <p className="mt-1 text-sm text-red-500">{errors.improvement_title}</p>
          )}
        </div>

        <div>
          <label htmlFor="improvement_type" className="block text-sm font-medium text-brand-gray3 mb-2">
            Improvement Type *
          </label>
          <select
            id="improvement_type"
            name="improvement_type"
            value={formData.improvement_type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          >
            <option value="">Select Improvement Type</option>
            <option value="Process Improvement">Process Improvement</option>
            <option value="Technology Upgrade">Technology Upgrade</option>
            <option value="Quality Enhancement">Quality Enhancement</option>
            <option value="Cost Reduction">Cost Reduction</option>
            <option value="Efficiency Improvement">Efficiency Improvement</option>
            <option value="Customer Experience">Customer Experience</option>
            <option value="Compliance Enhancement">Compliance Enhancement</option>
            <option value="Other">Other</option>
          </select>
          {errors.improvement_type && (
            <p className="mt-1 text-sm text-red-500">{errors.improvement_type}</p>
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
          <label htmlFor="business_case" className="block text-sm font-medium text-brand-gray3 mb-2">
            Business Case *
          </label>
          <textarea
            id="business_case"
            name="business_case"
            value={formData.business_case}
            onChange={handleChange}
            rows={3}
            placeholder="Enter business case"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.business_case && (
            <p className="mt-1 text-sm text-red-500">{errors.business_case}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="expected_benefits" className="block text-sm font-medium text-brand-gray3 mb-2">
            Expected Benefits *
          </label>
          <textarea
            id="expected_benefits"
            name="expected_benefits"
            value={formData.expected_benefits}
            onChange={handleChange}
            rows={3}
            placeholder="Enter expected benefits"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.expected_benefits && (
            <p className="mt-1 text-sm text-red-500">{errors.expected_benefits}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="implementation_plan" className="block text-sm font-medium text-brand-gray3 mb-2">
            Implementation Plan *
          </label>
          <textarea
            id="implementation_plan"
            name="implementation_plan"
            value={formData.implementation_plan}
            onChange={handleChange}
            rows={3}
            placeholder="Enter implementation plan"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.implementation_plan && (
            <p className="mt-1 text-sm text-red-500">{errors.implementation_plan}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="success_criteria" className="block text-sm font-medium text-brand-gray3 mb-2">
            Success Criteria *
          </label>
          <textarea
            id="success_criteria"
            name="success_criteria"
            value={formData.success_criteria}
            onChange={handleChange}
            rows={3}
            placeholder="Enter success criteria"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
          {errors.success_criteria && (
            <p className="mt-1 text-sm text-red-500">{errors.success_criteria}</p>
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
          <label htmlFor="start_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="target_completion_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Target Completion Date
          </label>
          <input
            type="date"
            id="target_completion_date"
            name="target_completion_date"
            value={formData.target_completion_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="actual_completion_date" className="block text-sm font-medium text-brand-gray3 mb-2">
            Actual Completion Date
          </label>
          <input
            type="date"
            id="actual_completion_date"
            name="actual_completion_date"
            value={formData.actual_completion_date}
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
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
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
          <label htmlFor="budget_allocated" className="block text-sm font-medium text-brand-gray3 mb-2">
            Budget Allocated
          </label>
          <input
            type="number"
            id="budget_allocated"
            name="budget_allocated"
            value={formData.budget_allocated}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div>
          <label htmlFor="actual_cost" className="block text-sm font-medium text-brand-gray3 mb-2">
            Actual Cost
          </label>
          <input
            type="number"
            id="actual_cost"
            name="actual_cost"
            value={formData.actual_cost}
            onChange={handleChange}
            min="0"
            step="0.01"
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
          <label htmlFor="roi_calculation" className="block text-sm font-medium text-brand-gray3 mb-2">
            ROI Calculation
          </label>
          <textarea
            id="roi_calculation"
            name="roi_calculation"
            value={formData.roi_calculation}
            onChange={handleChange}
            rows={3}
            placeholder="Enter ROI calculation"
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
          <label htmlFor="next_steps" className="block text-sm font-medium text-brand-gray3 mb-2">
            Next Steps
          </label>
          <textarea
            id="next_steps"
            name="next_steps"
            value={formData.next_steps}
            onChange={handleChange}
            rows={3}
            placeholder="Enter next steps"
            className="w-full px-4 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-brand-gray1"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="related_processes" className="block text-sm font-medium text-brand-gray3 mb-2">
            Related Processes
          </label>
          <textarea
            id="related_processes"
            name="related_processes"
            value={formData.related_processes}
            onChange={handleChange}
            rows={3}
            placeholder="Enter related processes"
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
            documentType="business-improvements"
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
          {editData ? 'Update Business Improvement' : 'Add Business Improvement'}
        </button>
      </div>
    </form>
  );
}
