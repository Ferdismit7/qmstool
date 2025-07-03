'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { CenteredLoadingSpinner } from './ui/LoadingSpinner';

/**
 * Interface representing a Risk Management Control
 * @interface RiskManagementControl
 */
interface RiskManagementControl {
  /** Unique identifier for the control */
  id: number;
  /** Name of the process this control is associated with */
  process_name: string;
  /** Description of the activity being controlled */
  activity_description: string;
  /** Description of the issue being addressed */
  issue_description: string;
  /** Type of issue being addressed */
  issue_type: string;
  /** Likelihood score (1-5) */
  likelihood: number;
  /** Impact score (1-5) */
  impact: number;
  /** Calculated risk score (likelihood * impact) */
  risk_score: number;
  /** Description of the control measure */
  control_description: string;
  /** Type of control measure */
  control_type: 'Preventive' | 'Detective' | 'Corrective';
  /** Person responsible for the control */
  control_owner: string;
  /** Effectiveness rating of the control */
  control_effectiveness: 'High' | 'Medium' | 'Low';
  /** Remaining risk after control implementation */
  residual_risk: number;
  /** Current status of the control */
  status: 'Open' | 'Under Review' | 'Closed';
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Props for the RiskManagementTable component
 * @interface RiskManagementTableProps
 */
interface RiskManagementTableProps {
  /** Array of risk management controls to display */
  controls: RiskManagementControl[];
  /** Whether the table is in a loading state */
  loading: boolean;
  /** Optional callback function when a control is edited */
  onEdit?: (control: RiskManagementControl) => void;
  /** Optional callback function to refresh the table data */
  refresh?: () => void;
}

/**
 * Styles for different control statuses
 * @constant
 */
const statusStyles = {
  'Open': 'bg-red-500 text-white',
  'Under Review': 'bg-orange-500 text-white',
  'Closed': 'bg-green-500 text-white',
} as const;

/**
 * Styles for different control effectiveness levels
 * @constant
 */
const effectivenessStyles = {
  'High': 'bg-green-500 text-white',
  'Medium': 'bg-orange-500 text-white',
  'Low': 'bg-red-500 text-white',
} as const;

/**
 * Column definitions for the risk management table
 * @constant
 */
const columns = [
  { key: 'process_name', label: 'Process Name' },
  { key: 'activity_description', label: 'Activity Description' },
  { key: 'issue_description', label: 'Issue Description' },
  { key: 'issue_type', label: 'Issue Type' },
  { key: 'likelihood', label: 'Likelihood' },
  { key: 'impact', label: 'Impact' },
  { key: 'risk_score', label: 'Risk Score' },
  { key: 'control_description', label: 'Control Description' },
  { key: 'control_type', label: 'Control Type' },
  { key: 'control_owner', label: 'Control Owner' },
  { key: 'control_effectiveness', label: 'Control Effectiveness' },
  { key: 'residual_risk', label: 'Residual Risk' },
  { key: 'status', label: 'Status' },
];

/**
 * RiskManagementTable Component
 * 
 * A comprehensive table component for displaying and managing risk controls.
 * Features include:
 * - Expandable cells for long content
 * - Status indicators with color coding
 * - Control effectiveness visualization
 * - Risk score and residual risk display
 * - Edit and delete functionality
 * - Responsive design with horizontal scrolling
 * - Accessibility features
 * 
 * @component
 * @param {RiskManagementTableProps} props - Component props
 * @example
 * ```tsx
 * <RiskManagementTable 
 *   controls={controls}
 *   loading={false}
 *   onEdit={handleEdit}
 *   refresh={refreshData}
 * />
 * ```
 * 
 * @returns {JSX.Element} A table displaying risk management controls with interactive features
 */
export default function RiskManagementTable({ controls, loading, onEdit, refresh }: RiskManagementTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Deletes a risk management control
   * @param {number} id - The ID of the control to delete
   */
  const deleteControl = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this risk control?')) return;
    try {
      const response = await fetch(`/api/risk-management/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete control');
      if (refresh) refresh();
    } catch (err) {
      console.error('Error deleting control:', err);
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
                let value = control[col.key as keyof RiskManagementControl];
                const cellId = `cell-${control.id}-${col.key}`;

                // Special rendering for status column
                if (col.key === 'status') {
                  return (
                    <td
                      key={cellId}
                      className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                      data-cell-id={cellId}
                      style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                    >
                      <div
                        className={`status-cell-content text-xs text-center font-medium cursor-pointer rounded-full ${statusStyles[value as keyof typeof statusStyles] || 'bg-gray-500 text-white'}`}
                        tabIndex={0}
                        aria-expanded={expandedCell === cellId}
                        onClick={() => handleCellClick(cellId)}
                      >
                        {value}
                      </div>
                    </td>
                  );
                }

                // Special rendering for control effectiveness column
                if (col.key === 'control_effectiveness') {
                  return (
                    <td
                      key={cellId}
                      className={`py-2 px-0 text-brand-white group relative${expandedCell === cellId ? ' expanded' : ''}`}
                      data-cell-id={cellId}
                      style={expandedCell === cellId ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}
                    >
                      <div
                        className={`status-cell-content text-xs text-center font-medium cursor-pointer rounded-full ${effectivenessStyles[value as keyof typeof effectivenessStyles] || 'bg-gray-500 text-white'}`}
                        tabIndex={0}
                        aria-expanded={expandedCell === cellId}
                        onClick={() => handleCellClick(cellId)}
                      >
                        {value}
                      </div>
                    </td>
                  );
                }

                // Special rendering for numeric columns
                if (['likelihood', 'impact', 'risk_score', 'residual_risk'].includes(col.key)) {
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
                      deleteControl(control.id);
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
  );
} 