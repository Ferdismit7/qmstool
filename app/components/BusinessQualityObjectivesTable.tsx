'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CenteredLoadingSpinner } from './ui/LoadingSpinner';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Notification from './Notification';

/**
 * Interface representing a Business Quality Objective
 * @interface BusinessQualityObjective
 */
interface BusinessQualityObjective {
  /** Unique identifier for the objective */
  id: number;
  /** Category of the objective */
  category: string;
  /** Business area the objective belongs to */
  business_area: string;
  /** Sub-business area for more specific categorization */
  sub_business_area: string;
  /** Main objectives of the QMS */
  qms_main_objectives: string;
  /** Detailed description of the objective */
  qms_objective_description: string;
  /** KPI or SLA targets associated with the objective */
  kpi_or_sla_targets: string;
  /** Performance monitoring details */
  performance_monitoring: string;
  /** Proof of measuring the objective */
  proof_of_measuring: string;
  /** Proof of reporting the objective */
  proof_of_reporting: string;
  /** Frequency of monitoring */
  frequency: string;
  /** Person or team responsible for the objective */
  responsible_person_team: string;
  /** Date when the objective should be reviewed */
  review_date: string;
  /** Current progress status */
  progress: string;
  /** Percentage of completion */
  status_percentage: number;
  /** Document status */
  doc_status: string;
}

/**
 * Styles for different progress statuses
 * @constant
 */
const progressStatusStyles = {
  'Not Started': 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  'On-Track': 'bg-green-500 text-white',
  'Minor Challenges': 'bg-orange-500 text-white',
  'Major Challenges': 'bg-red-500 text-white',
  'Completed': 'bg-green-500 text-white',
} as const;

/**
 * Styles for different status values
 * @constant
 */
const statusStyles = {
  'Completed': 'bg-green-500 text-white',
  'New': 'bg-blue-500 text-white',
  'In progress': 'bg-yellow-500 text-white',
  'To be reviewed': 'bg-orange-500 text-white',
} as const;

/**
 * BusinessQualityObjectivesTable Component
 * 
 * A comprehensive table component for displaying and managing business quality objectives.
 * Features include:
 * - Sorting by any column
 * - Expandable cells for long content
 * - Status indicators with color coding
 * - Progress tracking
 * - CRUD operations
 * 
 * @component
 * @example
 * ```tsx
 * <BusinessQualityObjectivesTable />
 * ```
 * 
 * @returns {JSX.Element} A table displaying business quality objectives with interactive features
 */
export default function BusinessQualityObjectivesTable() {
  const [objectives, setObjectives] = useState<BusinessQualityObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState<BusinessQualityObjective | null>(null);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const response = await fetch('/api/business-quality-objectives');
      if (!response.ok) throw new Error('Failed to fetch objectives');
      const result = await response.json();
      
      // Handle the API response structure: { success: true, data: objectives }
      if (result.success && Array.isArray(result.data)) {
        setObjectives(result.data);
      } else if (Array.isArray(result)) {
        // Fallback for direct array response
        setObjectives(result);
      } else {
        setObjectives([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (objective: BusinessQualityObjective) => {
    setObjectiveToDelete(objective);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!objectiveToDelete) return;

    try {
      const response = await fetch(`/api/business-quality-objectives/soft-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: objectiveToDelete.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete objective');
      }

      await response.json();
      
      // Show success notification
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Objective successfully deleted'
      });
      
      // Remove from local state
      setObjectives(objectives.filter(obj => obj.id !== objectiveToDelete.id));
      
      // Close modal
      setShowDeleteModal(false);
      setObjectiveToDelete(null);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete objective'
      });
    }
  };

  const handleCellClick = (cellId: string) => {
    setExpandedCell(prev => (prev === cellId ? null : cellId));
  };

  // Collapse expanded cell on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!expandedCell) return;
      // Only collapse if the click is outside the table wrapper (including scrollbar)
      if (tableWrapperRef.current && !tableWrapperRef.current.contains(event.target as Node)) {
        setExpandedCell(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedCell]);

  const sortedObjectives = objectives;

  /**
   * Formats a date string to the GB locale format
   * @param {string | null | undefined} dateString - The date string to format
   * @returns {string} Formatted date string or empty string if no date provided
   */
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (loading) return <CenteredLoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  const columns = [
    { key: 'category', label: 'Category' },
    { key: 'business_area', label: 'Business Area' },
    { key: 'sub_business_area', label: 'Sub Business Area' },
    { key: 'qms_main_objectives', label: 'Main Objectives' },
    { key: 'qms_objective_description', label: 'Description' },
    { key: 'kpi_or_sla_targets', label: 'KPI/SLA Targets' },
    { key: 'performance_monitoring', label: 'Performance Monitoring' },
    { key: 'proof_of_measuring', label: 'Proof of Measuring' },
    { key: 'proof_of_reporting', label: 'Proof of Reporting' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'responsible_person_team', label: 'Responsible' },
    { key: 'review_date', label: 'Review Date' },
    { key: 'progress', label: 'Progress' },
    { key: 'status_percentage', label: 'Status %' },
    { key: 'doc_status', label: 'Status' },
  ];

  return (
    <>
      <div ref={tableWrapperRef} className="overflow-x-auto pl-0 rounded-lg border border-brand-dark/20 shadow-lg bg-gray-800/40 backdrop-blur-sm" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
      <style jsx global>{`
        .cell-content {
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: all 0.2s;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          display: block;
          color: var(--color-brand-white);
          font-size: 0.75rem;
          line-height: 1rem;
          text-align: left;
          vertical-align: top;
        }
        .status-cell-content {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          min-width: fit-content;
          text-align: left;
          vertical-align: top;
        }
        td.expanded .cell-content {
          white-space: normal;
          overflow-x: auto;
          background: rgba(13, 16, 31, 0.75);
          border: 1px solid #3b82f6;
          border-radius: 0.5rem;
          max-width: 100%;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>

      <table className="w-full bg-transparent">
        <thead>
          <tr className="bg-brand-dark sticky top-0">
            {columns.map(col => (
              <th
                key={col.key}
                className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top"
              >
                {col.label}
              </th>
            ))}
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[80px] text-left align-top">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedObjectives.map((objective) => (
            <tr
              key={objective.id}
              className="bg-white/3 rounded-xl overflow-hidden shadow-md mb-3 hover:bg-white/20 transition-colors"
              style={{ borderCollapse: 'separate', borderSpacing: 0 }}
            >
              {columns.map((col) => {
                const cellId = `cell-${objective.id}-${col.key}`;
                let value = objective[col.key as keyof BusinessQualityObjective];
                
                if (col.key === 'review_date') {
                  value = formatDate(value as string);
                }

                // Special rendering for status column
                if (col.key === 'progress') {
                  return (
                    <td
                      key={cellId}
                      className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                      data-cell-id={cellId}
                      style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                    >
                      <div
                                                  className={`status-cell-content text-xs font-medium cursor-pointer rounded-full ${progressStatusStyles[value as keyof typeof progressStatusStyles] || 'bg-gray-500 text-white'}`}
                        tabIndex={0}
                        aria-expanded={expandedCell === cellId}
                        onClick={() => handleCellClick(cellId)}
                      >
                        {value}
                      </div>
                    </td>
                  );
                }

                // Special rendering for status percentage column
                if (col.key === 'status_percentage') {
                  const statusValue = objective.progress;
                  return (
                    <td
                      key={cellId}
                      className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                      data-cell-id={cellId}
                      style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                    >
                      <div
                                                  className={`status-cell-content text-xs font-medium cursor-pointer rounded-full ${progressStatusStyles[statusValue as keyof typeof progressStatusStyles] || 'bg-gray-500 text-white'}`}
                        tabIndex={0}
                        aria-expanded={expandedCell === cellId}
                        onClick={() => handleCellClick(cellId)}
                      >
                        {value}%
                      </div>
                    </td>
                  );
                }

                // Special rendering for status column
                if (col.key === 'doc_status') {
                  return (
                    <td
                      key={cellId}
                      className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                      data-cell-id={cellId}
                      style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                    >
                      <div
                                                  className={`status-cell-content text-xs font-medium cursor-pointer rounded-full ${statusStyles[value as keyof typeof statusStyles] || 'bg-gray-500 text-white'}`}
                        tabIndex={0}
                        aria-expanded={expandedCell === cellId}
                        onClick={() => handleCellClick(cellId)}
                      >
                        {value}
                      </div>
                    </td>
                  );
                }

                // Default rendering for other columns
                return (
                  <td
                    key={cellId}
                    className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                    data-cell-id={cellId}
                    style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                  >
                    <div
                                              className="cell-content text-xs font-medium cursor-pointer"
                      tabIndex={0}
                      aria-expanded={expandedCell === cellId}
                      onClick={() => handleCellClick(cellId)}
                    >
                      {value}
                    </div>
                  </td>
                );
              })}
              <td className="py-2 px-1 text-brand-white group relative w-[80px]">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/business-quality-objectives/${objective.id}/edit`);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                                              handleDeleteClick(objective);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Delete Confirmation Modal */}
    <DeleteConfirmationModal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setObjectiveToDelete(null);
      }}
      onConfirm={handleDeleteConfirm}
      itemName={objectiveToDelete?.qms_main_objectives || ''}
      itemType="business quality objective"
    />

    {/* Notification */}
    <Notification
      isOpen={notification.isOpen}
      onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      type={notification.type}
      title={notification.title}
      message={notification.message}
    />
  </>
);
} 