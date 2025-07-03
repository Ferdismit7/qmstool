'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiCalendar, FiUser, FiMapPin, FiCheckCircle, FiXCircle, FiAlertTriangle, FiMinus } from 'react-icons/fi';
import { AssessmentStatus } from '@/app/types/qmsAssessment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * QMS Assessment Detail Interface
 */
interface QMSAssessmentDetail {
  id: number;
  businessArea: string;
  assessorName: string;
  assessmentDate: string;
  createdAt: string;
  items: Array<{
    id: number;
    section: string;
    clauseReference: string;
    itemNumber: string;
    itemDescription: string;
    status: AssessmentStatus;
    comment?: string;
  }>;
  approval?: {
    id: number;
    conductedBy?: string;
    conductedDate?: string;
    approvedBy?: string;
    approvedDate?: string;
  };
}

/**
 * QMS Assessment Detail Edit Interface
 */
interface QMSAssessmentDetailEdit extends Omit<QMSAssessmentDetail, 'approval'> {
  approval?: {
    id?: number;
    conductedBy?: string;
    conductedDate?: string;
    approvedBy?: string;
    approvedDate?: string;
  };
}

/**
 * QMS Assessment Detail Page Component
 * 
 * This component displays a detailed view of a single QMS assessment
 * with all its items, responses, and approval information.
 * 
 * @component
 * @example
 * ```tsx
 * <QMSAssessmentDetailPage />
 * ```
 */
export default function QMSAssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<QMSAssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editState, setEditState] = useState<QMSAssessmentDetailEdit | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /**
   * Fetches the assessment details from the API
   */
  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/qms-assessments/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setAssessment(result.data);
      } else {
        setError(result.error || 'Failed to fetch assessment');
      }
    } catch (error) {
      setError('Network error occurred while fetching assessment');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles downloading the assessment as PDF
   */
  const handleDownload = () => {
    if (!assessment) return;
    const doc = new jsPDF();

    // Add logo (if available in /public/images/risk-matrix.png)
    // Uncomment and use if you want to embed a logo:
    // doc.addImage('/images/risk-matrix.png', 'PNG', 10, 10, 30, 20);

    // Title
    doc.setFontSize(18);
    doc.text('QMS Internal Self-Assessment', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Assessment #${assessment.id}`, 105, 26, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(10, 30, 200, 30);

    // Metadata
    let y = 36;
    doc.setFontSize(11);
    doc.text(`Business Area: ${assessment.businessArea}`, 14, y);
    doc.text(`Assessor: ${assessment.assessorName}`, 110, y);
    y += 7;
    doc.text(`Assessment Date: ${assessment.assessmentDate}`, 14, y);
    doc.text(`Created: ${assessment.createdAt}`, 110, y);
    y += 10;

    // For each section, add a table
    const groupedItems = groupItemsBySection(assessment.items);
    Object.entries(groupedItems).forEach(([sectionNumber, items]) => {
      y += 8;
      doc.setFontSize(13);
      doc.text(`Section ${sectionNumber}: ${getSectionTitle(sectionNumber)}`, 14, y);
      y += 2;
      autoTable(doc, {
        startY: y,
        head: [[
          'Clause',
          'Item #',
          'Description',
          'Status',
          'Comment',
        ]],
        body: items.map(item => [
          item.clauseReference,
          item.itemNumber,
          item.itemDescription,
          item.status,
          item.comment || ''
        ]),
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 14, right: 14 },
        theme: 'grid',
      });
      y = (doc as any).lastAutoTable?.finalY || y + 30;
    });

    // Approvals
    if (assessment.approval) {
      y += 10;
      doc.setFontSize(13);
      doc.text('Approvals', 14, y);
      y += 4;
      doc.setFontSize(10);
      const approvalRows = [
        ['Assessment Conducted By', assessment.approval.conductedBy || ''],
        ['Date (Assessor)', assessment.approval.conductedDate || ''],
        ['Approved By Governing Body', assessment.approval.approvedBy || ''],
        ['Date (Approval)', assessment.approval.approvedDate || ''],
      ];
      autoTable(doc, {
        startY: y,
        head: [['Field', 'Value']],
        body: approvalRows,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [39, 174, 96], textColor: 255 },
        margin: { left: 14, right: 14 },
        theme: 'grid',
      });
    }

    // Save PDF
    doc.save(`QMS-Assessment-${assessment.id}.pdf`);
  };

  /**
   * Formats date for display
   * @param dateString - The date string to format
   * @returns Formatted date string
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Gets status badge styling and icon
   * @param status - The assessment status
   * @returns Object with CSS classes and icon component
   */
  const getStatusInfo = (status: AssessmentStatus) => {
    switch (status) {
      case 'C':
        return {
          style: 'bg-green-500/20 text-green-300 border-green-500/50',
          icon: FiCheckCircle,
          label: 'Conform / In Place'
        };
      case 'NC':
        return {
          style: 'bg-red-500/20 text-red-300 border-red-500/50',
          icon: FiXCircle,
          label: 'Non-Conformance'
        };
      case 'OFI':
        return {
          style: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
          icon: FiAlertTriangle,
          label: 'Opportunity for Improvement'
        };
      case 'NA':
        return {
          style: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
          icon: FiMinus,
          label: 'Not Applicable'
        };
      default:
        return {
          style: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
          icon: FiMinus,
          label: 'Unknown'
        };
    }
  };

  /**
   * Groups assessment items by section
   * @param items - Array of assessment items
   * @returns Object with items grouped by section
   */
  const groupItemsBySection = (items: QMSAssessmentDetail['items']) => {
    const grouped: Record<string, QMSAssessmentDetail['items']> = {};
    
    items.forEach(item => {
      if (!grouped[item.section]) {
        grouped[item.section] = [];
      }
      grouped[item.section].push(item);
    });
    
    return grouped;
  };

  /**
   * Gets section title based on section number
   * @param sectionNumber - The section number
   * @returns Section title
   */
  const getSectionTitle = (sectionNumber: string) => {
    const titles: Record<string, string> = {
      '1': 'Quality Management System & Processes (Clause 4.2/4.4/6.1/6.2/7)',
      '2': 'Support – Resources, Competence, Awareness (Clause 7)',
      '3': 'Operations (Clause 8)',
      '4': 'Performance Monitoring & Improvement (Clauses 9 & 10)'
    };
    
    return titles[sectionNumber] || `Section ${sectionNumber}`;
  };

  // When entering edit mode, copy assessment to editState
  useEffect(() => {
    if (editMode && assessment) {
      setEditState(JSON.parse(JSON.stringify(assessment)));
    }
    if (!editMode) {
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [editMode, assessment]);

  // Handle input changes for metadata
  const handleMetaChange = (field: keyof QMSAssessmentDetail, value: string) => {
    if (!editState) return;
    setEditState({ ...editState, [field]: value });
  };

  // Handle item field changes
  const handleItemChange = (itemId: number, field: 'status' | 'comment', value: string) => {
    if (!editState) return;
    setEditState({
      ...editState,
      items: editState.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  // Handle approval field changes
  const handleApprovalChange = (field: string, value: string) => {
    if (!editState) return;
    setEditState({
      ...editState,
      approval: {
        ...editState.approval,
        [field]: value
      }
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!editState) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const response = await fetch(`/api/qms-assessments/${editState.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editState)
      });
      const result = await response.json();
      if (result.success) {
        setEditMode(false);
        setSaveSuccess(true);
        setAssessment(result.data);
      } else {
        setSaveError(result.error || 'Failed to save changes');
      }
    } catch (error) {
      setSaveError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditMode(false);
    setEditState(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  // Fetch assessment on component mount
  useEffect(() => {
    if (params.id) {
      fetchAssessment();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-300 text-lg mb-2">
            {error || 'Assessment not found'}
          </div>
          <button
            onClick={() => router.back()}
            className="text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const groupedItems = groupItemsBySection(assessment.items);

  return (
    <div className="w-full px-6 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-brand-gray2 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={20} />
            Back to Assessments
          </button>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="ml-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-white mb-2">
              QMS Assessment #{assessment.id}
            </h1>
            <p className="text-brand-gray2">
              ISO 9001 Internal Self-Assessment Details
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-brand-gray2/20 border border-brand-gray2/50 text-brand-white rounded-lg hover:bg-brand-gray2/30 transition-colors"
            >
              <FiDownload size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {editMode && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-60"
          >
            Cancel
          </button>
          {saveError && <span className="text-red-400 ml-4">{saveError}</span>}
          {saveSuccess && <span className="text-green-400 ml-4">Saved!</span>}
        </div>
      )}

      {/* Assessment Metadata */}
      <div className="bg-brand-gray2/10 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-brand-white">Assessment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <FiMapPin className="text-brand-primary" size={20} />
            <div>
              <div className="text-sm text-brand-gray2">Business Area</div>
              {editMode && editState ? (
                <input
                  type="text"
                  value={editState.businessArea || ''}
                  onChange={e => handleMetaChange('businessArea', e.target.value)}
                  className="text-brand-white font-medium bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg px-2 py-1 w-full"
                />
              ) : (
                <div className="text-brand-white font-medium">{assessment.businessArea}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiUser className="text-brand-primary" size={20} />
            <div>
              <div className="text-sm text-brand-gray2">Assessor</div>
              {editMode && editState ? (
                <input
                  type="text"
                  value={editState.assessorName || ''}
                  onChange={e => handleMetaChange('assessorName', e.target.value)}
                  className="text-brand-white font-medium bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg px-2 py-1 w-full"
                />
              ) : (
                <div className="text-brand-white font-medium">{assessment.assessorName}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiCalendar className="text-brand-primary" size={20} />
            <div>
              <div className="text-sm text-brand-gray2">Assessment Date</div>
              {editMode && editState ? (
                <input
                  type="date"
                  value={editState.assessmentDate || ''}
                  onChange={e => handleMetaChange('assessmentDate', e.target.value)}
                  className="text-brand-white font-medium bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg px-2 py-1 w-full"
                />
              ) : (
                <div className="text-brand-white font-medium">{formatDate(assessment.assessmentDate)}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiCalendar className="text-brand-primary" size={20} />
            <div>
              <div className="text-sm text-brand-gray2">Created</div>
              <div className="text-brand-white font-medium">{formatDate(assessment.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Items */}
      <div className="space-y-6">
        {Object.entries(groupItemsBySection(editMode && editState ? editState.items : assessment.items)).map(([sectionNumber, items]) => (
          <div key={sectionNumber} className="bg-brand-gray2/10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-brand-white">
              SECTION {sectionNumber}: {getSectionTitle(sectionNumber)}
            </h3>
            <div className="space-y-4">
              {items.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={item.id} className="border border-brand-gray2/30 p-4 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="font-semibold text-brand-primary">{item.itemNumber}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-brand-white mb-3">{item.itemDescription}</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-brand-gray2 mb-1">
                              Status
                            </label>
                            {editMode ? (
                              <select
                                value={item.status}
                                onChange={e => handleItemChange(item.id, 'status', e.target.value)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border bg-brand-gray2/20 border-brand-gray2/50 text-brand-white"
                              >
                                <option value="C">Conform / In Place</option>
                                <option value="NC">Non-Conformance</option>
                                <option value="OFI">Opportunity for Improvement</option>
                                <option value="NA">Not Applicable</option>
                              </select>
                            ) : (
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${statusInfo.style}`}>
                                <StatusIcon size={16} />
                                <span className="text-sm font-medium">{statusInfo.label}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-brand-gray2 mb-1">
                              Comments
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                value={item.comment || ''}
                                onChange={e => handleItemChange(item.id, 'comment', e.target.value)}
                                className="text-brand-white text-sm bg-brand-gray2/20 p-3 rounded-lg w-full border border-brand-gray2/50"
                              />
                            ) : item.comment ? (
                              <div className="text-brand-white text-sm bg-brand-gray2/20 p-3 rounded-lg">
                                {item.comment}
                              </div>
                            ) : (
                              <div className="text-brand-gray3 italic">No comment</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Approvals Section */}
      {(editMode && editState ? editState.approval : assessment.approval) && (
        <div className="mt-8 bg-brand-gray2/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-brand-white">✅ Approvals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Assessment Conducted By
              </label>
              {editMode && editState ? (
                <input
                  type="text"
                  value={editState.approval?.conductedBy || ''}
                  onChange={e => handleApprovalChange('conductedBy', e.target.value)}
                  className="text-brand-white bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg px-2 py-1 w-full"
                />
              ) : (
                <div className="text-brand-white">{assessment.approval?.conductedBy}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Date (Assessor)
              </label>
              {editMode && editState ? (
                <input
                  type="date"
                  value={editState.approval?.conductedDate || ''}
                  onChange={e => handleApprovalChange('conductedDate', e.target.value)}
                  className="text-brand-white bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg px-2 py-1 w-full"
                />
              ) : (
                <div className="text-brand-white">{assessment.approval?.conductedDate ? formatDate(assessment.approval.conductedDate) : ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Approved By Governing Body
              </label>
              {editMode && editState ? (
                <input
                  type="text"
                  value={editState.approval?.approvedBy || ''}
                  onChange={e => handleApprovalChange('approvedBy', e.target.value)}
                  className="text-brand-white bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg px-2 py-1 w-full"
                />
              ) : (
                <div className="text-brand-white">{assessment.approval?.approvedBy}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">
                Date (Approval)
              </label>
              {editMode && editState ? (
                <input
                  type="date"
                  value={editState.approval?.approvedDate || ''}
                  onChange={e => handleApprovalChange('approvedDate', e.target.value)}
                  className="text-brand-white bg-brand-gray2/20 border border-brand-gray2/50 rounded-lg px-2 py-1 w-full"
                />
              ) : (
                <div className="text-brand-white">{assessment.approval?.approvedDate ? formatDate(assessment.approval.approvedDate) : ''}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 