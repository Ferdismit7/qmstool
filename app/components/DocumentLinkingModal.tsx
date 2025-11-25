'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiSearch, FiCheck, FiFileText } from 'react-icons/fi';

interface BusinessDocument {
  id: number;
  document_name: string;
  document_type: string;
  version: string;
  doc_status: string;
  progress: string;
  status_percentage: number;
  business_area: string;
  sub_business_area?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  uploaded_at?: string;
}

interface DocumentLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkDocuments: (documentIds: number[]) => Promise<void>;
  businessArea?: string;
  excludeProcessId?: number;
  excludeDocumentId?: number;
  businessProcessName?: string;
}

export default function DocumentLinkingModal({
  isOpen,
  onClose,
  onLinkDocuments,
  businessArea,
  excludeProcessId,
  excludeDocumentId,
  businessProcessName,
}: DocumentLinkingModalProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<BusinessDocument[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<BusinessDocument[]>([]);
  const [groupedDocuments, setGroupedDocuments] = useState<Record<string, BusinessDocument[]>>({});
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch available documents
  const fetchAvailableDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (businessArea) params.append('businessArea', businessArea);
      if (excludeProcessId) params.append('excludeProcessId', excludeProcessId.toString());
      if (excludeDocumentId) params.append('excludeDocumentId', excludeDocumentId.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDocumentType) params.append('documentType', selectedDocumentType);

      const response = await fetch(`/api/business-documents/available?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available documents');
      }

      const result = await response.json();
      if (result.success) {
        setAvailableDocuments(result.data.documents);
        setGroupedDocuments(result.data.groupedDocuments);
        
        // Extract unique document types for filter
        const documentTypes = result.data.documents.map((doc: BusinessDocument) => doc.document_type).filter(Boolean) as string[];
        const types = [...new Set(documentTypes)];
        setDocumentTypes(types);
      } else {
        throw new Error(result.error || 'Failed to fetch documents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch documents when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDocuments();
    }
  }, [isOpen, searchTerm, selectedDocumentType, businessArea, excludeProcessId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleDocumentToggle = (document: BusinessDocument) => {
    const isSelected = selectedDocuments.some(doc => doc.id === document.id);
    
    if (isSelected) {
      setSelectedDocuments(selectedDocuments.filter(doc => doc.id !== document.id));
    } else {
      setSelectedDocuments([...selectedDocuments, document]);
    }
  };

  const handleLinkDocuments = async () => {
    if (selectedDocuments.length === 0) return;

    try {
      setIsLinking(true);
      setError(null);
      await onLinkDocuments(selectedDocuments.map(doc => doc.id));
      setSelectedDocuments([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLinking(false);
    }
  };

  const handleClose = () => {
    setSelectedDocuments([]);
    setSearchTerm('');
    setSelectedDocumentType('');
    setError(null);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-brand-gray2 border border-brand-gray1 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-gray1">
          <div>
            <h2 className="text-xl font-semibold text-brand-white">
              Link Documents
            </h2>
            {businessProcessName && (
              <p className="text-sm text-brand-gray3 mt-1">
                Link documents to: <span className="text-brand-white font-medium">{businessProcessName}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-brand-gray1 bg-brand-gray1/30">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray3" size={16} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-gray1 border border-brand-gray1 rounded-lg text-brand-white placeholder-brand-gray3 focus:border-brand-primary focus:outline-none"
                />
              </div>
              
              {/* Document Type Filter */}
              {documentTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-gray3 mb-2">
                    Filter by Document Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDocumentType('')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedDocumentType === ''
                          ? 'bg-brand-primary text-white'
                          : 'bg-brand-gray1 text-brand-gray3 hover:bg-brand-gray1/80 hover:text-brand-white'
                      }`}
                    >
                      All Types
                    </button>
                    {documentTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedDocumentType(type)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          selectedDocumentType === type
                            ? 'bg-brand-primary text-white'
                            : 'bg-brand-gray1 text-brand-gray3 hover:bg-brand-gray1/80 hover:text-brand-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                <span className="ml-3 text-brand-gray3">Loading documents...</span>
              </div>
            ) : availableDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FiFileText size={48} className="mx-auto text-brand-gray3 mb-3" />
                <h3 className="text-lg font-medium text-brand-white mb-2">No Documents Available</h3>
                <p className="text-brand-gray3">
                  No documents found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedDocuments).map(([type, documents]) => (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-brand-white">
                        {type}
                      </h3>
                      <span className="text-sm text-brand-gray3">
                        ({documents.length} document{documents.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    
                    <div className="grid gap-3">
                      {documents.map((doc) => {
                        const isSelected = selectedDocuments.some(selected => selected.id === doc.id);
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleDocumentToggle(doc)}
                            className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors ${
                              isSelected 
                                ? 'bg-brand-primary/20 border border-brand-primary/30' 
                                : 'hover:bg-brand-gray1 border border-transparent'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-brand-primary border-brand-primary' 
                                : 'border-brand-gray3'
                            }`}>
                              {isSelected && <FiCheck size={12} className="text-white" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-brand-white truncate">
                                  {doc.document_name}
                                </span>
                                <span className="text-xs text-brand-gray3">v{doc.version}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-1 rounded-full ${getStatusColor(doc.doc_status)}`}>
                                  {doc.doc_status}
                                </span>
                                <span className={`px-2 py-1 rounded-full ${getProgressColor(doc.progress)}`}>
                                  {doc.progress}
                                </span>
                                <span className="text-brand-gray3">
                                  {doc.status_percentage}%
                                </span>
                              </div>
                              
                              {doc.sub_business_area && (
                                <div className="text-xs text-brand-gray3 mt-1">
                                  {doc.business_area} • {doc.sub_business_area}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-brand-gray1 bg-brand-gray1/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-brand-gray3">
                {selectedDocuments.length > 0 && (
                  <span>
                    {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
                  disabled={isLinking}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkDocuments}
                  disabled={selectedDocuments.length === 0 || isLinking}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLinking ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave size={12} />
                  )}
                  {isLinking ? 'Linking...' : `Link ${selectedDocuments.length} Document${selectedDocuments.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
