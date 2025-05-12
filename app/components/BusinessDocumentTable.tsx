'use client';

import { useState, useEffect } from 'react';

export interface BusinessDocument {
  id: string;
  documentName: string;
  documentType: string;
  version: string;
  progress: string;
  status: string;
  statusPercentage: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  targetDate: string;
  documentOwner: string;
  updateDate: string;
  remarks: string | null;
  reviewDate: string | null;
  businessArea: string;
  subBusinessArea: string;
  nameAndNumbering: string;
}

interface BusinessDocumentTableProps {
  documents: BusinessDocument[];
  loading: boolean;
  onEdit?: (document: BusinessDocument) => void;
  refresh?: () => void;
}

export default function BusinessDocumentTable({ documents, loading, onEdit, refresh }: BusinessDocumentTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCell(expandedCell === cellId ? null : cellId);
  };

  const handleClickOutside = () => {
    setExpandedCell(null);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const deleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`/api/business-documents?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete document');
        }
        
        if (refresh) {
          refresh();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      }
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
    <div className="overflow-x-auto">
      <style jsx>{`
        .cell-content {
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .expanded-content {
          position: absolute;
          top: 100%;
          left: 0;
          background: #1a1a1a;
          padding: 8px;
          border-radius: 4px;
          z-index: 10;
          min-width: 200px;
          max-width: 300px;
          word-wrap: break-word;
          white-space: normal;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
      <table className="min-w-full bg-transparent">
        <thead>
          <tr className="bg-brand-dark sticky top-0">
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Business Area</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Sub Business Area</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Name and Numbering</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Document Name</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Document Type</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Version</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Status</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Progress</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Status %</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Priority</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Target Date</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Document Owner</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Update Date</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Remarks</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px]">Review Date</th>
            <th className="py-2 text-brand-white font-medium text-xs uppercase tracking-wider w-[80px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...documents].reverse().map((document) => (
            <tr key={document.id} className="hover:bg-brand-gray1/10 transition-colors">
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-businessArea`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-businessArea`, e)}
                >
                  {document.businessArea}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-subBusinessArea`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-subBusinessArea`, e)}
                >
                  {document.subBusinessArea}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-nameAndNumbering`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-nameAndNumbering`, e)}
                >
                  {document.nameAndNumbering}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-documentName`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-documentName`, e)}
                >
                  {document.documentName}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-documentType`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-documentType`, e)}
                >
                  {document.documentType}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-version`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-version`, e)}
                >
                  {document.version}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-status`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center font-medium ${
                    document.status === 'Completed' ? 'text-green-500' :
                    document.status === 'In progress' ? 'text-orange-400' :
                    document.status === 'New' ? 'text-cyan-400' :
                    document.status === 'To be reviewed' ? 'text-blue-300' :
                    'text-brand-white'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${document.id}-status`, e)}
                >
                  {document.status}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-progress`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center font-medium ${
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
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-statusPercentage`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center font-medium ${
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
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-priority`}>
                <div 
                  className={`truncate cursor-pointer cell-content text-xs px-2 text-center font-medium ${
                    document.priority === 'Critical' ? 'text-red-500' :
                    document.priority === 'High' ? 'text-orange-400' :
                    document.priority === 'Medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}
                  onClick={(e) => handleCellClick(`cell-${document.id}-priority`, e)}
                >
                  {document.priority}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-targetDate`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-targetDate`, e)}
                >
                  {new Date(document.targetDate).toLocaleDateString('en-GB')}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-documentOwner`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-documentOwner`, e)}
                >
                  {document.documentOwner}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-updateDate`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-updateDate`, e)}
                >
                  {new Date(document.updateDate).toLocaleDateString('en-GB')}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-remarks`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-remarks`, e)}
                >
                  {document.remarks}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[120px]" data-cell-id={`cell-${document.id}-reviewDate`}>
                <div 
                  className="truncate cursor-pointer cell-content text-xs px-2 text-center"
                  onClick={(e) => handleCellClick(`cell-${document.id}-reviewDate`, e)}
                >
                  {document.reviewDate ? new Date(document.reviewDate).toLocaleDateString('en-GB') : '-'}
                </div>
              </td>
              <td className="py-2 text-brand-white group relative w-[80px]">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit(document);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(document.id);
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