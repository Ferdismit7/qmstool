'use client';

import React, { useState, useEffect } from 'react';
import { FiEye, FiDownload, FiCalendar, FiUser, FiMapPin } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import { CenteredLoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { QMSAssessmentSummary, AssessmentStatus } from '@/app/types/qmsAssessment';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * QMS Assessments Listing Page Component
 * 
 * This component displays all saved QMS Internal Self-Assessments with
 * detailed view capabilities.
 * 
 * @component
 * @example
 * ```tsx
 * <QMSAssessmentsPage />
 * ```
 */
export default function QMSAssessmentsPage() {
  const [assessments, setAssessments] = useState<QMSAssessmentSummary[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<QMSAssessmentSummary[]>([]);
  const [userBusinessAreas, setUserBusinessAreas] = useState<string[]>([]);
  const [selectedBusinessArea, setSelectedBusinessArea] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Fetches user's business areas
   */
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
        
        // Don't pre-select a business area - let user see all assessments by default
        // Only pre-select if user has exactly one business area
        if (userData.businessAreas.length === 1) {
          setSelectedBusinessArea(userData.businessAreas[0]);
        } else {
          setSelectedBusinessArea(''); // Show all business areas
        }
      } else {
        console.error('Failed to fetch user business areas:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user business areas:', error);
    }
  };

  /**
   * Fetches all QMS assessments from the API
   */
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/qms-assessments');
      const result = await response.json();

      if (result.success) {
        console.log('Fetched assessments:', result.data);
        setAssessments(result.data);
      } else {
        setError(result.error || 'Failed to fetch assessments');
      }
    } catch (error) {
      setError('Network error occurred while fetching assessments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters assessments based on selected business area
   */
  useEffect(() => {
    console.log('Filtering assessments:', {
      totalAssessments: assessments.length,
      selectedBusinessArea,
      userBusinessAreasCount: userBusinessAreas.length,
      assessments: assessments.map(a => ({ id: a.id, businessArea: a.businessArea }))
    });

    // Only filter if a business area is explicitly selected AND user has multiple business areas
    if (selectedBusinessArea && userBusinessAreas.length > 1) {
      const filtered = assessments.filter(assessment => 
        assessment.businessArea === selectedBusinessArea
      );
      console.log('Filtered assessments:', filtered.map(a => ({ id: a.id, businessArea: a.businessArea })));
      setFilteredAssessments(filtered);
    } else {
      // Show all assessments if no filter is applied or user only has one business area
      console.log('Showing all assessments');
      setFilteredAssessments(assessments);
    }
  }, [assessments, selectedBusinessArea, userBusinessAreas.length]);

  /**
   * Handles viewing a specific assessment
   * @param assessmentId - The ID of the assessment to view
   */
  const handleViewAssessment = (assessmentId: number) => {
    router.push(`/qms-assessments/${assessmentId}`);
  };

  /**
   * Handles downloading an assessment as PDF
   * @param assessmentId - The ID of the assessment to download
   */
  const handleDownloadAssessment = async (assessmentId: number) => {
    try {
      // Fetch the full assessment data
      const response = await fetch(`/api/qms-assessments/${assessmentId}`);
      const result = await response.json();

      if (!result.success) {
        console.error('Failed to fetch assessment for download:', result.error);
        return;
      }

      const assessment = result.data;
      const doc = new jsPDF();

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

      // Group items by section
      const groupedItems: Record<string, any[]> = {};
      assessment.items.forEach((item: any) => {
        if (!groupedItems[item.section]) {
          groupedItems[item.section] = [];
        }
        groupedItems[item.section].push(item);
      });

      // For each section, add a table
      Object.entries(groupedItems).forEach(([sectionNumber, items]) => {
        y += 8;
        doc.setFontSize(13);
        const sectionTitle = getSectionTitle(sectionNumber);
        doc.text(`Section ${sectionNumber}: ${sectionTitle}`, 14, y);
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
          body: items.map((item: any) => [
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
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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

  /**
   * Formats date for display
   * @param dateString - The date string to format
   * @returns Formatted date string
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Gets status badge styling
   * @param status - The assessment status
   * @returns CSS classes for styling
   */
  const getStatusBadgeStyle = (status: AssessmentStatus) => {
    switch (status) {
      case 'C':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'NC':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'OFI':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'NA':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  // Fetch assessments on component mount
  useEffect(() => {
    fetchAssessments();
    fetchUserBusinessAreas();
  }, []);

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="mb-8 px-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-white mb-2">
              QMS Internal Self-Assessments
            </h1>
            <p className="text-brand-gray2">
              View and manage all your saved ISO 9001 internal assessments
            </p>
          </div>
          <button
            onClick={() => router.push('/qms-internal-assessment')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-brand-white hover:bg-brand-blue/90 transition-colors"
          >
            <FaPlus size={16} />
            New Assessment
          </button>
        </div>

        {/* Business Area Filter */}
        {userBusinessAreas.length > 1 && (
          <div className="flex items-center gap-4 mb-4">
            <label className="text-brand-white font-medium">Filter by Business Area:</label>
            <select
              value={selectedBusinessArea}
              onChange={(e) => setSelectedBusinessArea(e.target.value)}
              className="px-4 py-2 rounded-lg bg-brand-gray1 text-brand-white border border-brand-gray2 focus:outline-none focus:border-brand-primary"
            >
              <option value="">All Business Areas</option>
              {userBusinessAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <CenteredLoadingSpinner />
      )}

      {/* Assessments List */}
      {!loading && (
        <div className="space-y-4">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-brand-gray2 text-lg mb-2">
                No assessments found
              </div>
              <p className="text-brand-gray3">
                Create your first QMS assessment to get started
              </p>
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-brand-gray2/10 p-6 rounded-lg border border-brand-gray2/30 hover:border-brand-primary/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Assessment Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-brand-white">
                        Assessment #{assessment.id}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand-gray2">
                          {assessment.itemCount} items
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-brand-primary" size={16} />
                        <span className="text-brand-gray2">Business Area:</span>
                        <span className="text-brand-white">{assessment.businessArea}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUser className="text-brand-primary" size={16} />
                        <span className="text-brand-gray2">Assessor:</span>
                        <span className="text-brand-white">{assessment.assessorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-brand-primary" size={16} />
                        <span className="text-brand-gray2">Date:</span>
                        <span className="text-brand-white">{formatDate(assessment.assessmentDate)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-brand-gray3">
                      Created: {formatDate(assessment.createdAt)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewAssessment(assessment.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
                      title="View Assessment"
                    >
                      <FiEye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadAssessment(assessment.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-gray2/20 border border-brand-gray2/50 text-brand-white rounded-lg hover:bg-brand-gray2/30 transition-colors"
                      title="Download PDF"
                    >
                      <FiDownload size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && filteredAssessments.length > 0 && (
        <div className="mt-8 p-4 bg-brand-gray2/10 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-white">{filteredAssessments.length}</div>
              <div className="text-sm text-brand-gray2">Total Assessments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {filteredAssessments.filter(a => true).length}
              </div>
              <div className="text-sm text-brand-gray2">This Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {filteredAssessments.length > 0 ? Math.round(filteredAssessments.reduce((sum, a) => sum + a.itemCount, 0) / filteredAssessments.length) : 0}
              </div>
              <div className="text-sm text-brand-gray2">Avg Items/Assessment</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {new Set(filteredAssessments.map(a => a.businessArea)).size}
              </div>
              <div className="text-sm text-brand-gray2">Business Areas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 