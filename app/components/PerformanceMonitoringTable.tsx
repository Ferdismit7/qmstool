'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CenteredLoadingSpinner } from './ui/LoadingSpinner';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Notification from './Notification';

interface PerformanceMonitoringControl {
  id: number;
  business_area: string;
  sub_business_area: string;
  Name_reports: string;
  doc_type: string;
  priority: string;
  doc_status: string;
  progress: string;
  status_percentage: number;
  target_date: string;
  proof: string;
  frequency: string;
  responsible_persons: string;
  remarks: string;
}

interface PerformanceMonitoringTableProps {
  controls: PerformanceMonitoringControl[];
  loading: boolean;
  onEdit?: (control: PerformanceMonitoringControl) => void;
  refresh?: () => void;
}

// Add progress status styles
const progressStatusStyles = {
  'Completed': 'bg-green-500 text-white',
  'On-Track': 'bg-blue-500 text-white',
  'Minor Challenges': 'bg-yellow-500 text-white',
  'Major Challenges': 'bg-red-500 text-white',
} as const;

const columns = [
  { key: 'business_area', label: 'Business Area' },
  { key: 'sub_business_area', label: 'Sub Business Area' },
  { key: 'Name_reports', label: 'Report Name' },
  { key: 'doc_type', label: 'Type' },
  { key: 'priority', label: 'Priority' },
  { key: 'doc_status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'status_percentage', label: 'Status %' },
  { key: 'target_date', label: 'Target Date' },
  { key: 'proof', label: 'Proof' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'responsible_persons', label: 'Responsible Persons' },
  { key: 'remarks', label: 'Remarks' },
];

export default function PerformanceMonitoringTable({ controls, loading, onEdit, refresh }: PerformanceMonitoringTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [controlToDelete, setControlToDelete] = useState<PerformanceMonitoringControl | null>(null);
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

  const handleDeleteClick = (control: PerformanceMonitoringControl) => {
    setControlToDelete(control);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!controlToDelete) return;

    try {
      const response = await fetch(`/api/performance-monitoring/soft-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: controlToDelete.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete control');
      }

      await response.json();
      
      // Show success notification
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Performance monitoring control successfully deleted'
      });
      
      // Refresh the table
      if (refresh) refresh();
      
      // Close modal
      setShowDeleteModal(false);
      setControlToDelete(null);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete control'
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
      if (tableWrapperRef.current && !tableWrapperRef.current.contains(event.target as Node)) {
        setExpandedCell(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedCell]);

  if (loading) return <CenteredLoadingSpinner />;
  if (!controls) return <div>No data.</div>;

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
          {controls.map((control) => (
            <tr
              key={control.id}
              className="bg-white/3 rounded-xl overflow-hidden shadow-md mb-3 hover:bg-white/20 transition-colors"
              style={{ borderCollapse: 'separate', borderSpacing: 0 }}
            >
              {columns.map((col) => {
                let value = control[col.key as keyof PerformanceMonitoringControl];
                const cellId = `cell-${control.id}-${col.key}`;

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
                if (col.key === 'status_percentage') {
                  const progressValue = control.progress;
                  return (
                    <td
                      key={cellId}
                      className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                      data-cell-id={cellId}
                      style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                    >
                      <div
                        className={`status-cell-content text-xs text-center font-medium cursor-pointer rounded-full ${progressStatusStyles[progressValue as keyof typeof progressStatusStyles] || 'bg-gray-500 text-white'}`}
                        tabIndex={0}
                        aria-expanded={expandedCell === cellId}
                        onClick={() => handleCellClick(cellId)}
                      >
                        {value}%
                      </div>
                    </td>
                  );
                }

                // Special rendering for date fields
                if (col.key === 'target_date') {
                  if (value) {
                    const date = new Date(value as string);
                    // Adjust for timezone offset
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    value = adjustedDate.toLocaleDateString('en-GB');
                  } else {
                    value = '';
                  }
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
                      if (onEdit) onEdit(control);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                                              handleDeleteClick(control);
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
        setControlToDelete(null);
      }}
      onConfirm={handleDeleteConfirm}
      itemName={controlToDelete?.Name_reports || ''}
      itemType="performance monitoring control"
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