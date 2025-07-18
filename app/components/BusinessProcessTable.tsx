'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { BusinessProcessRegister } from '@/lib/types/businessProcessRegister';
import { PROGRESS_STATUS } from '@/lib/types/businessProcessRegister';
import { CenteredLoadingSpinner } from './ui/LoadingSpinner';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Notification from './Notification';

/**
 * Styles for different progress statuses
 * @constant
 */
const progressStatusStyles = {
  [PROGRESS_STATUS.COMPLETED]: 'bg-green-500 text-white',
  [PROGRESS_STATUS.ON_TRACK]: 'bg-blue-500 text-white',
  [PROGRESS_STATUS.MINOR_CHALLENGES]: 'bg-orange-500 text-white',
  [PROGRESS_STATUS.MAJOR_CHALLENGES]: 'bg-red-500 text-white',
} as const;

/**
 * Props for the BusinessProcessTable component
 * @interface BusinessProcessTableProps
 */
interface BusinessProcessTableProps {
  /** Array of business processes to display */
  processes: BusinessProcessRegister[];
  /** Whether the table is in a loading state */
  loading: boolean;
  /** Optional callback function when a process is edited */
  onEdit?: (process: BusinessProcessRegister) => void;
  /** Optional callback function to refresh the table data */
  refresh?: () => void;
}

/**
 * Column definitions for the business process table
 * @constant
 */
const columns = [
  { key: 'businessArea', label: 'Business Area' },
  { key: 'subBusinessArea', label: 'Sub Business Area' },
  { key: 'processName', label: 'Process Name' },
  { key: 'documentName', label: 'Document Name' },
  { key: 'version', label: 'Version' },
  { key: 'progress', label: 'Progress' },
  { key: 'docStatus', label: 'Status' },
  { key: 'statusPercentage', label: 'Status %' },
  { key: 'priority', label: 'Priority' },
  { key: 'targetDate', label: 'Target Date' },
  { key: 'processOwner', label: 'Process Owner' },
  { key: 'updateDate', label: 'Update Date' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'reviewDate', label: 'Review Date' },
];

/**
 * BusinessProcessTable Component
 * 
 * A comprehensive table component for displaying and managing business processes.
 * Features include:
 * - Expandable cells for long content
 * - Progress status indicators with color coding
 * - Status percentage visualization
 * - Edit and delete functionality
 * - Responsive design with horizontal scrolling
 * - Accessibility features
 * 
 * @component
 * @param {BusinessProcessTableProps} props - Component props
 * @example
 * ```tsx
 * <BusinessProcessTable 
 *   processes={processes}
 *   loading={false}
 *   onEdit={handleEdit}
 *   refresh={refreshData}
 * />
 * ```
 * 
 * @returns {JSX.Element} A table displaying business processes with interactive features
 */
export default function BusinessProcessTable({ processes, loading, onEdit, refresh }: BusinessProcessTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<BusinessProcessRegister | null>(null);
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

  /**
   * Opens the delete confirmation modal
   * @param {BusinessProcessRegister} process - The process to delete
   */
  const handleDeleteClick = (process: BusinessProcessRegister) => {
    setProcessToDelete(process);
    setShowDeleteModal(true);
  };

  /**
   * Performs the soft delete operation
   */
  const handleDeleteConfirm = async () => {
    if (!processToDelete) return;

    try {
      // Get the auth token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/business-processes/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: processToDelete.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete process');
      }

      await response.json();
      
      // Show success notification
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Process successfully deleted'
      });
      
      // Refresh the table
      if (refresh) refresh();
      
      // Close modal
      setShowDeleteModal(false);
      setProcessToDelete(null);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete process'
      });
    }
  };

  /**
   * Handles cell click events for expanding/collapsing cell content
   * @param {string} cellId - The ID of the clicked cell
   */
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

  if (loading) return <CenteredLoadingSpinner />;
  if (!processes) return <div>No data.</div>;

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
          }
          .status-cell-content {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            min-width: fit-content;
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
              {[...processes].reverse().map((process) => (
              <tr
                key={process.id}
                className="bg-white/3 rounded-xl overflow-hidden shadow-md mb-3 hover:bg-white/20 transition-colors"
                style={{ borderCollapse: 'separate', borderSpacing: 0 }}
              >
                {columns.map((col) => {
                  let value = process[col.key as keyof BusinessProcessRegister];
                  if (col.key === 'statusPercentage') {
                    const percent = process.statusPercentage ?? 0;
                    value = percent.toString() + '%';
                  }
                  if (col.key === 'targetDate' || col.key === 'updateDate' || col.key === 'reviewDate') {
                    value = value ? new Date(value as string).toLocaleDateString('en-GB') : (col.key === 'reviewDate' ? '-' : '');
                  } else {
                    value = String(value ?? '');
                  }
                  const cellId = `cell-${process.id}-${col.key}`;
                  
                  // Special rendering for progress column
                  if (col.key === 'progress') {
                    return (
                      <td
                        key={cellId}
                        className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                        data-cell-id={cellId}
                        style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                      >
                        <div
                          className={`status-cell-content text-xs text-center font-medium cursor-pointer rounded-full ${progressStatusStyles[value as keyof typeof progressStatusStyles] || 'bg-gray-500 text-white'}`}
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
                  if (col.key === 'statusPercentage') {
                    const progressValue = process.progress;
                    return (
                      <td
                        key={cellId}
                        className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                        data-cell-id={cellId}
                        style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                      >
                        <div
                          className={`status-cell-content text-xs text-center font-medium cursor-pointer ${progressStatusStyles[progressValue as keyof typeof progressStatusStyles] || 'text-gray-500'}`}
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
                        className="cell-content text-xs text-center font-medium cursor-pointer"
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
                      onClick={e => {
                            e.stopPropagation();
                        if (onEdit) onEdit(process);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          Edit
                        </button>
                      <button
                      onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(process);
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
          setProcessToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={processToDelete?.processName || ''}
        itemType="business process"
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