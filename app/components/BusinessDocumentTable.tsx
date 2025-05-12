'use client';

import { useState, useEffect } from 'react';
import { BusinessDocument } from '../types/businessDocument';
import { useRouter } from 'next/navigation';

interface BusinessDocumentTableProps {
  documents: BusinessDocument[];
  loading: boolean;
  onEdit?: (document: BusinessDocument) => void;
  onDelete?: (id: string) => void;
  refresh?: () => void;
}

export default function BusinessDocumentTable({ documents, loading, onEdit, onDelete, refresh }: BusinessDocumentTableProps) {
  const router = useRouter();
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const handleCellClick = (cellId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const div = e.currentTarget;
    const td = div.parentElement;
    if (expandedCell === cellId) {
      td?.classList.remove('expanded');
      setExpandedCell(null);
      return;
    }
    if (expandedCell) {
      const prevTd = document.querySelector(`td[data-cell-id="${expandedCell}"]`);
      prevTd?.classList.remove('expanded');
    }
    td?.classList.add('expanded');
    setExpandedCell(cellId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const deleteDocument = async (id: string, documentName: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${documentName}?`)) return;
    try {
      const response = await fetch(`/api/business-documents?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      if (refresh) {
        refresh();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  const columns = [
    { header: 'Business Area', accessor: 'businessArea' },
    { header: 'Sub Business Area', accessor: 'subBusinessArea' },
    { header: 'Name and Numbering', accessor: 'nameAndNumbering' },
    { header: 'Document Name', accessor: 'documentName' },
    { header: 'Document Type', accessor: 'documentType' },
    { header: 'Version', accessor: 'version' },
    { header: 'Status', accessor: 'status' },
    { header: 'Progress', accessor: 'progress' },
    { header: 'Status %', accessor: 'statusPercentage' },
    { header: 'Priority', accessor: 'priority' },
    { header: 'Target Date', accessor: 'targetDate' },
    { header: 'Owner', accessor: 'documentOwner' },
    { header: 'Actions', accessor: 'actions' },
  ];

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-full max-w-none" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
      <style jsx>{`
        .cell-content {
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 600px;
          min-width: 80px;
          transition: all 0.2s;
        }
        td.expanded .cell-content {
          white-space: normal;
          max-width: 500px;
          min-width: 300px;
          overflow-x: auto;
          background: #1a1a1a;
          border: 1px solid #3b82f6;
          border-radius: 0.5rem;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `}</style>
      <table className="w-full min-w-[1800px] text-sm text-center text-brand-white">
        <thead className="text-xs uppercase bg-brand-primary/90 text-brand-white">
          <tr>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Business Area</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Sub Business Area</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Document Name</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Name and Numbering</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Document Type</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Version</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Progress</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Status</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Status %</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Priority</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Target Date</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Document Owner</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Update Date</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Remarks</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Review Date</th>
            <th scope="col" className="px-3 py-2 whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id} className="border-b border-brand-gray1 hover:bg-brand-dark/60">
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-businessArea`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-businessArea`, e)}
                >
                  {document.businessArea}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-subBusinessArea`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-subBusinessArea`, e)}
                >
                  {document.subBusinessArea}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-documentName`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-documentName`, e)}
                >
                  {document.documentName}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-nameAndNumbering`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-nameAndNumbering`, e)}
                >
                  {document.nameAndNumbering}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-documentType`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-documentType`, e)}
                >
                  {document.documentType}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-version`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-version`, e)}
                >
                  {document.version}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-progress`}>
                <div
                  className={`cell-content text-xs px-2 text-center font-medium ${
                    document.progress === 'Completed' ? 'text-green-500' :
                    document.progress === 'On-Track' ? 'text-blue-400' :
                    document.progress === 'Minor Challenges' ? 'text-yellow-400' :
                    document.progress === 'Major Challenges' ? 'text-red-500' :
                    'text-brand-white'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${document.id}-progress`, e)}
                >
                  {document.progress}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-status`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-status`, e)}
                >
                  {document.status}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-statusPercentage`}>
                <div
                  className={`cell-content text-xs px-2 text-center font-medium ${
                    document.progress === 'Completed' ? 'text-green-500' :
                    document.progress === 'On-Track' ? 'text-blue-400' :
                    document.progress === 'Minor Challenges' ? 'text-yellow-400' :
                    document.progress === 'Major Challenges' ? 'text-red-500' :
                    'text-brand-white'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${document.id}-statusPercentage`, e)}
                >
                  {document.statusPercentage}%
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-priority`}>
                <div
                  className={`cell-content text-xs px-2 text-center font-medium ${
                    document.priority === 'Critical' ? 'text-red-500' :
                    document.priority === 'High' ? 'text-orange-400' :
                    document.priority === 'Medium' ? 'text-yellow-400' :
                    'text-green-500'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${document.id}-priority`, e)}
                >
                  {document.priority}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-targetDate`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-targetDate`, e)}
                >
                  {document.targetDate}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-documentOwner`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-documentOwner`, e)}
                >
                  {document.documentOwner}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-updateDate`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-updateDate`, e)}
                >
                  {document.updateDate}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-remarks`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-remarks`, e)}
                >
                  {document.remarks}
                </div>
              </td>
              <td className="py-1 text-brand-white group relative bg-brand-gray1/70" data-cell-id={`cell-${document.id}-reviewDate`}>
                <div
                  className="cell-content text-xs px-2 text-center font-medium cursor-pointer"
                  onClick={(e) => handleCellClick(`cell-${document.id}-reviewDate`, e)}
                >
                  {document.reviewDate}
                </div>
              </td>
                <td className="py-1 text-brand-white group relative bg-brand-gray1/70">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit(document);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete(document.id);
                      else deleteDocument(document.id, document.documentName);
                    }}
                    className="text-red-500 hover:text-red-700"
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