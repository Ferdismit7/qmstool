'use client';

import { useState, useEffect, useRef } from 'react';
import { BusinessDocument } from '../types/businessDocument';
import { CenteredLoadingSpinner } from './ui/LoadingSpinner';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Notification from './Notification';

interface BusinessDocumentTableProps {
  documents: BusinessDocument[];
  loading: boolean;
  onEdit?: (document: BusinessDocument) => void;
  onDelete?: (id: string) => void;
  refresh?: () => void;
}

export default function BusinessDocumentTable({ documents, loading, onEdit, onDelete, refresh }: BusinessDocumentTableProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<BusinessDocument | null>(null);
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

  const handleDeleteClick = (document: BusinessDocument) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      const response = await fetch(`/api/business-documents/soft-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: documentToDelete.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }

      await response.json();
      
      // Show success notification
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Document successfully deleted'
      });
      
      // Refresh the table
      if (refresh) refresh();
      
      // Close modal
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete document'
      });
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (loading) {
    return <CenteredLoadingSpinner />;
  }

  // Add color maps for badge fields
  const progressColor: Record<string, string> = {
    'Completed': 'bg-green-500 text-white',
    'On-Track': 'bg-blue-500 text-white',
    'Minor Challenges': 'bg-orange-500 text-white',
    'Major Challenges': 'bg-red-500 text-white',
    'Not Started': 'bg-gray-500 text-white',
  };
  const statusPercentageColor: Record<string, string> = {
    'Completed': 'bg-green-500 text-white',
    'On-Track': 'bg-blue-500 text-white',
    'Minor Challenges': 'bg-orange-500 text-white',
    'Major Challenges': 'bg-red-500 text-white',
    'Not Started': 'bg-gray-500 text-white',
  };

  return (
    <>
      <div ref={tableWrapperRef} className="overflow-x-auto pl-0 rounded-lg border border-brand-dark/50 shadow-lg backdrop-blur-sm" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
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
        td.expanded .cell-content {
          white-space: normal;
          overflow-x: auto;
          background: rgba(13, 16, 31, 0.75);
          border: 1px solid #3b82f6;
          border-radius: 0.5rem;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          word-wrap: break-word;
          word-break: break-word;
          max-width: 50%;
          padding: 0.75rem;
          line-height: 1.25rem;
        }
      `}</style>
      <table className="w-full bg-transparent">
        <thead>
          <tr className="bg-brand-dark sticky top-0">
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Business Area</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Sub Business Area</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Document Name</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Name and Numbering</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Document Type</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Version</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Progress</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Status</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Status %</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Priority</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Target Date</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Document Owner</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Update Date</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Remarks</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[120px] text-left align-top">Review Date</th>
            <th className="py-1 text-brand-white font-medium text-xs uppercase tracking-wider w-[80px] text-left align-top">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr
              key={document.id}
              className="bg-white/3 rounded-xl overflow-hidden shadow-md mb-3 hover:bg-white/20 transition-colors"
              style={{ borderCollapse: 'separate', borderSpacing: 0 }}
            >
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-business_area` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-business_area`}
                  style={expandedCell === `cell-${document.id}-business_area` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-business_area`)}
                >
                  {document.business_area}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-sub_business_area` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-sub_business_area`}
                  style={expandedCell === `cell-${document.id}-sub_business_area` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-sub_business_area`)}
                >
                  {document.sub_business_area}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-document_name` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-document_name`}
                  style={expandedCell === `cell-${document.id}-document_name` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-document_name`)}
                >
                  {document.document_name}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-name_and_numbering` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-name_and_numbering`}
                  style={expandedCell === `cell-${document.id}-name_and_numbering` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-name_and_numbering`)}
                >
                  {document.name_and_numbering}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-document_type` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-document_type`}
                  style={expandedCell === `cell-${document.id}-document_type` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-document_type`)}
                >
                  {document.document_type}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-version` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-version`}
                  style={expandedCell === `cell-${document.id}-version` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-version`)}
                >
                  {document.version}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-progress` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-progress`}
                  style={expandedCell === `cell-${document.id}-progress` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className={`inline-block px-3 text-xs py-1 rounded-full font-medium text-white ${progressColor[document.progress] || 'bg-gray-500'}`}
                  onClick={() => handleCellClick(`cell-${document.id}-progress`)}
                >
                  {document.progress}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-doc_status` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-doc_status`}
                  style={expandedCell === `cell-${document.id}-doc_status` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className={`inline-block px-3 text-xs py-1 rounded-full font-medium text-white ${progressColor[document.doc_status] || 'bg-gray-500'}`}
                  onClick={() => handleCellClick(`cell-${document.id}-doc_status`)}
                >
                  {document.doc_status}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-status_percentage` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-status_percentage`}
                  style={expandedCell === `cell-${document.id}-status_percentage` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className={`inline-block px-3 text-xs py-1 rounded-full font-medium text-white ${statusPercentageColor[document.progress] || 'bg-gray-500'}`}
                  onClick={() => handleCellClick(`cell-${document.id}-status_percentage`)}
                >
                  {(document.status_percentage ?? 0).toString()}%
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-priority` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-priority`}
                  style={expandedCell === `cell-${document.id}-priority` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-priority`)}
                >
                  {document.priority}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-target_date` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-target_date`}
                  style={expandedCell === `cell-${document.id}-target_date` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-target_date`)}
                >
                  {formatDate(document.target_date)}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-document_owner` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-document_owner`}
                  style={expandedCell === `cell-${document.id}-document_owner` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-document_owner`)}
                >
                  {document.document_owner}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-update_date` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-update_date`}
                  style={expandedCell === `cell-${document.id}-update_date` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-update_date`)}
                >
                  {formatDate(document.update_date)}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-remarks` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-remarks`}
                  style={expandedCell === `cell-${document.id}-remarks` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-remarks`)}
                >
                  {document.remarks}
                </div>
              </td>
              <td className={`py-2 px-0 text-brand-white group relative${expandedCell === `cell-${document.id}-review_date` ? ' expanded' : ''}`} 
                  data-cell-id={`cell-${document.id}-review_date`}
                  style={expandedCell === `cell-${document.id}-review_date` ? { minWidth: 300, maxWidth: 400, width: 400 } : { minWidth: 80, maxWidth: 120, width: 120 }}>
                <div
                  className="cell-content"
                  onClick={() => handleCellClick(`cell-${document.id}-review_date`)}
                >
                  {formatDate(document.review_date)}
                </div>
              </td>
              <td className="py-2 px-1 text-brand-white group relative w-[80px]">
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
                      if (onDelete) onDelete(document.id.toString());
                      else handleDeleteClick(document);
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
        setDocumentToDelete(null);
      }}
      onConfirm={handleDeleteConfirm}
      itemName={documentToDelete?.document_name || ''}
      itemType="business document"
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