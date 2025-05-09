'use client';

import { useState, useEffect } from 'react';

export interface BusinessProcess {
  id: string;
  businessArea: string;
  subBusinessArea: string;
  processName: string;
  documentName: string;
  version: string;
  progress: string;
  status: string;
  statusPercentage: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  targetDate: string;
  processOwner: string;
  updateDate: string;
  remarks: string | null;
  reviewDate: string | null;
}

interface BusinessProcessTableProps {
  processes: BusinessProcess[];
  loading: boolean;
  onEdit?: (process: BusinessProcess) => void;
  refresh?: () => void;
}

export default function BusinessProcessTable({ processes, loading, onEdit, refresh }: BusinessProcessTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  // Delete process
  const deleteProcess = async (id: string) => {
    try {
      const response = await fetch(`/api/business-processes?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete process');
      if (refresh) refresh();
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleCellClick = (cellId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const div = e.currentTarget;
    const td = div.parentElement;
    
    // If clicking the same cell, collapse it
    if (expandedCell === cellId) {
      td?.classList.remove('expanded');
      setExpandedCell(null);
      return;
    }

    // If there's a previously expanded cell, collapse it
    if (expandedCell) {
      const prevTd = document.querySelector(`td[data-cell-id="${expandedCell}"]`);
      prevTd?.classList.remove('expanded');
    }

    // Expand the clicked cell
    td?.classList.add('expanded');
    setExpandedCell(cellId);
  };

  // Add click outside handler to collapse expanded cell
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't collapse if clicking on scrollbar or table container
      if (event.target instanceof Element) {
        const isScrollbar = event.target.closest('.overflow-x-auto');
        if (isScrollbar) return;
      }

      if (expandedCell && !(event.target as Element).closest('.cell-content')) {
        const td = document.querySelector(`td[data-cell-id="${expandedCell}"]`);
        td?.classList.remove('expanded');
        setExpandedCell(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedCell]);

  if (loading) return <div>Loading...</div>;
  if (!processes) return <div>No data.</div>;

  return (
    <div className="overflow-x-auto pl-0 rounded-lg border border-brand-dark/20 shadow-lg bg-gray-800/40 backdrop-blur-sm" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
      <style jsx global>{`
        td.expanded {
          width: auto !important;
          min-width: 300px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
          background: rgba(43, 48, 56, 0.95);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 0.375rem;
          border: 1px solid rgba(75, 85, 99, 0.2);
        }
        td.expanded .cell-content {
          white-space: normal;
          padding: 0.75rem;
          background: rgba(31, 41, 55, 0.95);
          border-radius: 0.375rem;
        }
        th {
          white-space: nowrap;
          padding-left: 8px !important;
          padding-right: 8px !important;
          border-bottom: 1px solid rgba(75, 85, 99, 0.2);
        }
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1F2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
        /* Prevent text selection during scroll */
        .overflow-x-auto {
          user-select: none;
        }
        /* Add hover effect to rows */
        tbody tr:hover {
          background: rgba(75, 85, 99, 0.1);
        }
        /* Add subtle border between rows */
        tbody tr {
          border-bottom: 1px solid rgba(75, 85, 99, 0.1);
        }
        tbody tr:last-child {
          border-bottom: none;
        }
      `}</style>
      <table className="min-w-full bg-transparent">
        <thead>
          <tr className="bg-brand-dark sticky top-0">
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Business Area</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Sub Business Area</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Process Name</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Document Name</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Version</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Progress</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Status</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Status %</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Priority</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Target Date</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Process Owner</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Update Date</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Remarks</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Review Date</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[80px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...processes].reverse().map((process) => (
            <tr key={process.id} className="hover:bg-brand-gray1/10 transition-colors">
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-businessArea`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-businessArea`, e)}
                >
                  {process.businessArea}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-subBusinessArea`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-subBusinessArea`, e)}
                >
                  {process.subBusinessArea}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-processName`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-processName`, e)}
                >
                  {process.processName}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-documentName`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-documentName`, e)}
                >
                  {process.documentName}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-version`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-version`, e)}
                >
                  {process.version}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-progress`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center font-medium ${
                    process.progress === 'Completed' ? 'text-blue-500' :
                    process.progress === 'On-Track' ? 'text-emerald-500' :
                    process.progress === 'Minor Challenges' ? 'text-amber-500' :
                    process.progress === 'Major Challenges' ? 'text-red-500' :
                    'text-brand-white'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${process.id}-progress`, e)}
                >
                  {process.progress}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-status`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center font-medium ${
                    process.status === 'Completed' ? 'text-green-500' :
                    process.status === 'In progress' ? 'text-orange-400' :
                    process.status === 'New' ? 'text-cyan-400' :
                    process.status === 'To be reviewed' ? 'text-blue-300' :
                    'text-brand-white'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${process.id}-status`, e)}
                >
                  {process.status}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-statusPercentage`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center font-medium ${
                    process.status === 'Completed' ? 'text-green-500' :
                    process.status === 'In progress' ? 'text-orange-400' :
                    process.status === 'New' ? 'text-cyan-400' :
                    process.status === 'To be reviewed' ? 'text-blue-300' :
                    'text-brand-white'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${process.id}-statusPercentage`, e)}
                >
                  {process.statusPercentage}%
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-priority`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center ${
                    process.priority === 'Critical' ? 'text-red-500' :
                    process.priority === 'High' ? 'text-orange-400' :
                    process.priority === 'Medium' ? 'text-yellow-400' :
                    process.priority === 'Low' ? 'text-green-400' :
                    'text-brand-white'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${process.id}-priority`, e)}
                >
                  {process.priority}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-targetDate`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-targetDate`, e)}
                >
                  {new Date(process.targetDate).toLocaleDateString('en-GB')}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-processOwner`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-processOwner`, e)}
                >
                  {process.processOwner}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-updateDate`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-updateDate`, e)}
                >
                  {new Date(process.updateDate).toLocaleDateString('en-GB')}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-remarks`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-remarks`, e)}
                >
                  {process.remarks}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${process.id}-reviewDate`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${process.id}-reviewDate`, e)}
                >
                  {process.reviewDate ? new Date(process.reviewDate).toLocaleDateString('en-GB') : '-'}
                </div>
              </td>
              <td className="py-2 text-brand-white w-[80px]">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit(process);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProcess(process.id);
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