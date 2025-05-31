'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiRefreshCw } from 'react-icons/fi';

interface RiskManagementControl {
  id: number;
  process_name: string;
  activity_description: string;
  issue_description: string;
  issue_type: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  control_description: string;
  control_type: 'Preventive' | 'Detective' | 'Corrective';
  control_owner: string;
  control_effectiveness: 'High' | 'Medium' | 'Low';
  residual_risk: number;
  status: 'Open' | 'Under Review' | 'Closed';
  created_at: string;
  updated_at: string;
}

interface RiskManagementTableProps {
  controls: RiskManagementControl[];
  loading: boolean;
  onEdit?: (control: RiskManagementControl) => void;
  refresh?: () => void;
}

// Add status styles
const statusStyles = {
  'Open': 'bg-red-500 text-white',
  'Under Review': 'bg-orange-500 text-white',
  'Closed': 'bg-green-500 text-white',
} as const;

// Add control effectiveness styles
const effectivenessStyles = {
  'High': 'bg-green-500 text-white',
  'Medium': 'bg-orange-500 text-white',
  'Low': 'bg-red-500 text-white',
} as const;

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

export default function RiskManagementTable({ controls, loading, onEdit, refresh }: RiskManagementTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  // Delete control
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

  if (loading) return <div>Loading...</div>;
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
          <tr className="bg-brand-primary sticky top-0">
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