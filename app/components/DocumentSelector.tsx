'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiChevronDown, FiX, FiFileText, FiCheck } from 'react-icons/fi';

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

interface DocumentSelectorProps {
  selectedDocuments: BusinessDocument[];
  onDocumentsChange: (documents: BusinessDocument[]) => void;
  businessArea?: string;
  excludeProcessId?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showDocumentTypeFilter?: boolean;
}

export default function DocumentSelector({
  selectedDocuments,
  onDocumentsChange,
  businessArea,
  excludeProcessId,
  placeholder = "Select documents to link...",
  className = "",
  disabled = false,
  showDocumentTypeFilter = true
}: DocumentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [availableDocuments, setAvailableDocuments] = useState<BusinessDocument[]>([]);
  const [groupedDocuments, setGroupedDocuments] = useState<Record<string, BusinessDocument[]>>({});
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch available documents
  const fetchAvailableDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (businessArea) params.append('businessArea', businessArea);
      if (excludeProcessId) params.append('excludeProcessId', excludeProcessId.toString());
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

  // Fetch documents when dropdown opens or search term changes
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDocuments();
    }
  }, [isOpen, searchTerm, selectedDocumentType, businessArea, excludeProcessId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleDocumentToggle = (document: BusinessDocument) => {
    const isSelected = selectedDocuments.some(doc => doc.id === document.id);
    
    if (isSelected) {
      // Remove document
      onDocumentsChange(selectedDocuments.filter(doc => doc.id !== document.id));
    } else {
      // Add document
      onDocumentsChange([...selectedDocuments, document]);
    }
  };

  const handleRemoveDocument = (documentId: number) => {
    onDocumentsChange(selectedDocuments.filter(doc => doc.id !== documentId));
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Documents Display */}
      <div className="space-y-2">
        {selectedDocuments.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-white">
              Selected Documents ({selectedDocuments.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 bg-brand-primary/20 text-brand-white px-3 py-2 rounded-lg border border-brand-primary/30"
                >
                  <FiFileText size={16} />
                  <span className="text-sm font-medium">{doc.document_name}</span>
                  <span className="text-xs text-brand-gray3">({doc.document_type})</span>
                  {!disabled && (
                    <button
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-brand-gray3 hover:text-red-400 transition-colors"
                      type="button"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-3 bg-brand-gray2 border border-brand-gray1 rounded-lg text-left transition-colors ${
            disabled 
              ? 'text-brand-gray3 cursor-not-allowed' 
              : 'text-brand-white hover:border-brand-primary focus:border-brand-primary focus:outline-none'
          }`}
        >
          <span className={selectedDocuments.length === 0 ? 'text-brand-gray3' : 'text-brand-white'}>
            {selectedDocuments.length === 0 ? placeholder : `${selectedDocuments.length} document(s) selected`}
          </span>
          <FiChevronDown 
            size={20} 
            className={`text-brand-gray3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-gray2 border border-brand-gray1 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-brand-gray1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray3" size={16} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-brand-gray1 border border-brand-gray1 rounded-lg text-brand-white placeholder-brand-gray3 focus:border-brand-primary focus:outline-none"
              />
            </div>
            
            {/* Document Type Filter */}
            {showDocumentTypeFilter && documentTypes.length > 0 && (
              <div className="mt-3">
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

          {/* Documents List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-brand-gray3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary mx-auto mb-2"></div>
                Loading documents...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">
                {error}
              </div>
            ) : availableDocuments.length === 0 ? (
              <div className="p-4 text-center text-brand-gray3">
                No documents available
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedDocuments).map(([type, documents]) => (
                  <div key={type} className="mb-4">
                    <div className="px-2 py-1 text-xs font-medium text-brand-gray3 uppercase tracking-wider mb-2">
                      {type} ({documents.length})
                    </div>
                    <div className="space-y-1">
                      {documents.map((doc) => {
                        const isSelected = selectedDocuments.some(selected => selected.id === doc.id);
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleDocumentToggle(doc)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
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
                              <div className="flex items-center gap-2 mb-1">
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
        </div>
      )}
    </div>
  );
}
