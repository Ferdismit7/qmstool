'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { QMSAssessmentData, AssessmentStatus } from '@/app/types/qmsAssessment';

/**
 * QMS Internal Self-Assessment Page Component
 * 
 * This component provides a comprehensive internal self-assessment form for ISO 9001 compliance.
 * It includes metadata collection, assessment sections covering all major ISO 9001 clauses,
 * and approval workflows.
 * 
 * @component
 * @example
 * ```tsx
 * <QMSInternalAssessmentPage />
 * ```
 */
export default function QMSInternalAssessmentPage() {
  const router = useRouter();
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState<QMSAssessmentData>({
    // Metadata
    assessmentDateRange: { start: '', end: '' },
    businessArea: '',
    assessor: '',
    assessmentDate: '',
    
    // Section 1: Quality Management System & Processes
    section1: {
      '1.1': { status: '', comment: '' },
      '1.2': { status: '', comment: '' },
      '1.3': { status: '', comment: '' },
      '1.4': { status: '', comment: '' },
      '1.5': { status: '', comment: '' },
      '1.6': { status: '', comment: '' },
      '1.7': { status: '', comment: '' },
      '1.8': { status: '', comment: '' },
    },
    
    // Section 2: Support – Resources, Competence, Awareness
    section2: {
      '2.1': { status: '', comment: '' },
      '2.2': { status: '', comment: '' },
      '2.3': { status: '', comment: '' },
      '2.4': { status: '', comment: '' },
    },
    
    // Section 3: Operations
    section3: {
      '3.1': { status: '', comment: '' },
      '3.2': { status: '', comment: '' },
      '3.3': { status: '', comment: '' },
      '3.4': { status: '', comment: '' },
    },
    
    // Section 4: Performance Monitoring & Improvement
    section4: {
      '4.1': { status: '', comment: '' },
      '4.2': { status: '', comment: '' },
      '4.3': { status: '', comment: '' },
      '4.4': { status: '', comment: '' },
      '4.5': { status: '', comment: '' },
      '4.6': { status: '', comment: '' },
    },
    
    // Approvals
    assessmentConductedBy: '',
    assessorDate: '',
    approvedByGoverningBody: '',
    approvalDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const statusOptions: AssessmentStatus[] = ['C', 'NC', 'OFI', 'NA'];

  /**
   * Fetch user's business areas on component mount
   */
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
          setUserBusinessAreas(userData.businessAreas as string[] || []);
          
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

  /**
   * Handles form field changes for metadata and approval sections
   * @param field - The field name to update
   * @param value - The new value for the field
   */
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handles assessment item changes for all sections
   * @param section - The section name (section1, section2, etc.)
   * @param item - The item number (1.1, 1.2, etc.)
   * @param field - The field to update (status or comment)
   * @param value - The new value
   */
  const handleAssessmentChange = (section: string, item: string, field: 'status' | 'comment', value: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const sectionData = newData[section as keyof QMSAssessmentData] as Record<string, { status: string; comment: string }>;
      if (sectionData && sectionData[item]) {
        sectionData[item][field] = value;
      }
      return newData;
    });
  };

  /**
   * Gets the current value for an assessment item
   * @param sectionKey - The section key (section1, section2, etc.)
   * @param itemId - The item ID (1.1, 1.2, etc.)
   * @param field - The field to get (status or comment)
   * @returns The current value
   */
  const getAssessmentValue = (sectionKey: string, itemId: string, field: 'status' | 'comment') => {
    const section = formData[sectionKey as keyof QMSAssessmentData] as unknown;
    return (section as Record<string, Record<string, string>>)?.[itemId]?.[field] || '';
  };

  /**
   * Handles form submission
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/qms-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage({
          type: 'success',
          message: 'Assessment saved successfully!'
        });
        // Reset form after successful save
        setTimeout(() => {
          setSubmitMessage(null);
        }, 3000);
      } else {
        setSubmitMessage({
          type: 'error',
          message: result.error || 'Failed to save assessment'
        });
      }
    } catch {
      setSubmitMessage({
        type: 'error',
        message: 'Network error occurred while saving assessment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles downloading the assessment as PDF
   */
  const handleDownload = () => {
    // TODO: Implement PDF generation and download
    console.log('Downloading assessment...');
  };

  /**
   * Renders the legend section with status definitions
   */
  const renderLegend = () => (
    <div className="bg-brand-gray2/20 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-3 text-brand-white">Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white font-bold">C</span>
          <span className="text-brand-gray2">Conform / In Place</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white font-bold">NC</span>
          <span className="text-brand-gray2">Non-Conformance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white font-bold">OFI</span>
          <span className="text-brand-gray2">Opportunity for Improvement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center text-white font-bold">NA</span>
          <span className="text-brand-gray2">Not Applicable</span>
        </div>
      </div>
    </div>
  );

  /**
   * Renders an assessment section with items
   * @param sectionNumber - The section number (1, 2, 3, 4)
   * @param title - The section title
   * @param items - Array of assessment items with their labels
   */
  const renderAssessmentSection = (sectionNumber: number, title: string, items: Array<{id: string, label: string}>) => {
    const sectionKey = `section${sectionNumber}`;
    
    return (
      <div className="bg-brand-gray2/10 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4 text-brand-white">
          SECTION {sectionNumber}: {title}
        </h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-brand-gray2/30 p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="font-semibold text-brand-primary">{item.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-brand-white mb-3">{item.label}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray2 mb-1">
                        Status
                      </label>
                      <select
                        value={getAssessmentValue(sectionKey, item.id, 'status')}
                        onChange={(e) => handleAssessmentChange(sectionKey, item.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="">Select Status</option>
                        {statusOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray2 mb-1">
                        Comments
                      </label>
                      <textarea
                        value={getAssessmentValue(sectionKey, item.id, 'comment')}
                        onChange={(e) => handleAssessmentChange(sectionKey, item.id, 'comment', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                        placeholder="Enter your comments..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="mb-8 px-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-white mb-2">
              QMS Internal Self-Assessment (ISO 9001)
            </h1>
            <p className="text-brand-gray2">
              Comprehensive internal assessment for ISO 9001:2015 compliance
            </p>
          </div>
          <button
            onClick={() => router.push('/qms-assessments')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gray2/20 border border-brand-gray2/50 text-brand-white hover:bg-brand-gray2/30 transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Assessments
          </button>
        </div>
      </div>

      {/* Legend */}
      {renderLegend()}

      {/* Submission Message */}
      {submitMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          submitMessage.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
            : 'bg-red-500/20 border border-red-500/50 text-red-300'
        }`}>
          {submitMessage.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata Section */}
        <div className="bg-brand-gray2/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-brand-white">🧾 Metadata Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Date(s) of Assessment
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={formData.assessmentDateRange.start}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assessmentDateRange: { ...prev.assessmentDateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <input
                  type="date"
                  value={formData.assessmentDateRange.end}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assessmentDateRange: { ...prev.assessmentDateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Business Area
              </label>
              <select
                value={formData.businessArea}
                onChange={(e) => handleFieldChange('businessArea', e.target.value)}
                className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select Business Area</option>
                {userBusinessAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Assessor
              </label>
              <input
                type="text"
                value={formData.assessor}
                onChange={(e) => handleFieldChange('assessor', e.target.value)}
                className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter assessor name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Assessment Date
              </label>
              <input
                type="date"
                value={formData.assessmentDate}
                onChange={(e) => handleFieldChange('assessmentDate', e.target.value)}
                className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* Assessment Sections */}
        {renderAssessmentSection(1, 'Quality Management System & Processes (Clause 4.2/4.4/6.1/6.2/7)', [
          { id: '1.1', label: 'Are the needs and expectations of interested parties (e.g., customers, suppliers, regulatory bodies) understood and monitored?' },
          { id: '1.2', label: 'Evidence of evaluating/improving business processes' },
          { id: '1.3', label: 'SOP documentation is effective, measurable, usable, and protected' },
          { id: '1.4', label: 'QMS responsibilities are assigned and documented' },
          { id: '1.5', label: 'Needs/expectations of interested parties identified and risks assessed' },
          { id: '1.6', label: 'Statutory, regulatory, and customer requirements consistently met' },
          { id: '1.7', label: 'QMS objectives are SMART and reviewed regularly' },
          { id: '1.8', label: 'Confidentiality maintained in line with POPIA and internal policies' },
        ])}

        {renderAssessmentSection(2, 'Support – Resources, Competence, Awareness (Clause 7)', [
          { id: '2.1', label: 'Adequate human resources for QMS operation' },
          { id: '2.2', label: 'Personnel are competent via education, training, or experience' },
          { id: '2.3', label: 'Adequate facilities/equipment available and maintained' },
          { id: '2.4', label: 'Employees aware of QMS policies and their role in quality objectives' },
        ])}

        {renderAssessmentSection(3, 'Operations (Clause 8)', [
          { id: '3.1', label: 'Operational processes planned and controlled according to client requirements' },
          { id: '3.2', label: 'Monitoring and measuring of business processes and service delivery' },
          { id: '3.3', label: 'Quality assurance in place: abnormalities tracked, work traceable' },
          { id: '3.4', label: 'Client communication and confirmation of service/product delivery' },
        ])}

        {renderAssessmentSection(4, 'Performance Monitoring & Improvement (Clauses 9 & 10)', [
          { id: '4.1', label: 'QMS reviewed regularly; improvement actions implemented' },
          { id: '4.2', label: 'Service level turnaround time monitored and corrective action taken' },
          { id: '4.3', label: 'External service providers evaluated, where applicable' },
          { id: '4.4', label: 'Customer satisfaction monitored and communicated' },
          { id: '4.5', label: 'Compliments and appeals tracked and communicated' },
          { id: '4.6', label: 'Are non-conformities identified, corrected, and are actions taken to prevent recurrence?' },
        ])}

        {/* Approvals Section */}
        <div className="bg-brand-gray2/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-brand-white">✅ Approvals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Assessment Conducted By
              </label>
              <input
                type="text"
                value={formData.assessmentConductedBy}
                onChange={(e) => handleFieldChange('assessmentConductedBy', e.target.value)}
                className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Date (Assessor)
              </label>
              <input
                type="date"
                value={formData.assessorDate}
                onChange={(e) => handleFieldChange('assessorDate', e.target.value)}
                className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Approved By Governing Body
              </label>
              <input
                type="text"
                value={formData.approvedByGoverningBody}
                onChange={(e) => handleFieldChange('approvedByGoverningBody', e.target.value)}
                className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Date (Approval)
              </label>
              <input
                type="date"
                value={formData.approvalDate}
                onChange={(e) => handleFieldChange('approvalDate', e.target.value)}
                className="w-full px-3 py-2 bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center gap-4 mt-8">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-brand-gray2/20 border border-brand-gray2/50 text-brand-white rounded-lg hover:bg-brand-gray2/30 transition-colors"
          >
            <FiDownload size={18} />
            Download PDF
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave size={18} />
            {isSubmitting ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
} 