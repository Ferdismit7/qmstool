'use client';

import { useState, useEffect } from 'react';
import BusinessDocumentForm from '../components/BusinessDocumentForm';
import BusinessDocumentTable from '../components/BusinessDocumentTable';
import { BusinessDocument } from '../types/businessDocument';

const DOC_STATUS = ['New', 'In Progress', 'Completed', 'To be reviewed'] as const;
const PROGRESS_STATUS = ['Completed', 'On-Track', 'Minor Challenges', 'Major Challenges'] as const;
const PRIORITY = ['Low', 'Medium', 'High'] as const;

export default function DocumentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<BusinessDocument | null>(null);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all documents
  const fetchDocuments = async () => {
    setLoading(true);
    setDocuments([]); // Clear old data before fetching new
    try {
      const response = await fetch(`/api/business-documents?ts=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      console.log('Fetched documents:', data); // Debug log
      setDocuments(data);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Dashboard metrics
  const totalDocuments = documents.length;
  const completedDocuments = documents.filter(d => d.status === 'Completed').length;
  const inProgressDocuments = documents.filter(d => d.status === 'In progress').length;
  const criticalDocuments = documents.filter(d => d.priority === 'Critical').length;
  
  // Calculate overall progress by averaging all document status percentages
  const overallProgress = documents.length > 0
    ? Math.round(
        documents.reduce((sum, doc) => {
          const percentage = Number(doc.status_percentage) || 0;
          return sum + percentage;
        }, 0) / documents.length
      )
    : 0;
  
  console.log('Calculated overall progress:', overallProgress); // Debug log

  // Calculate counts for each option
  const statusCounts = documents.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const progressCounts = documents.reduce((acc, doc) => {
    acc[doc.progress] = (acc[doc.progress] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCounts = documents.reduce((acc, doc) => {
    acc[doc.priority] = (acc[doc.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleFormClose = () => setShowForm(false);

  const handleFormSubmit = async (data: BusinessDocument) => {
    try {
      const method = editData ? 'PUT' : 'POST';
      const url = editData 
        ? `/api/business-documents?id=${editData.id}`
        : '/api/business-documents';

      console.log('Submitting data:', data);
      console.log('Using URL:', url);
      console.log('Using method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.details || 'Failed to save document');
      }
      
      const result = await response.json();
      console.log('Server response:', result);
      
      setShowForm(false);
      setEditData(null); // Clear edit data after successful save
      await fetchDocuments(); // Refresh table after add/edit
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    }
  };

  const handleEdit = (document: BusinessDocument) => {
    // Format dates for the form
    const isValidDate = (date: any) => {
      if (!date) return false;
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    };

    const safeFormatDate = (date: any) => {
      if (!isValidDate(date)) return '';
      return new Date(date).toISOString().split('T')[0];
    };

    const formattedDocument = {
      ...document,
      target_date: safeFormatDate(document.target_date),
      review_date: safeFormatDate(document.review_date),
      update_date: safeFormatDate(document.update_date),
      status_percentage: document.status_percentage
    };
    setEditData(formattedDocument);
    setShowForm(true);
  };

  return (
    <div className="min-h-full">
      <div className="w-full py-1">
        <div className="w-full px-2">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold text-brand-white">Business Document Registry</h1>
            <button
              onClick={handleAdd}
              className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Document
            </button>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-between">
              <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Overall Progress</h3>
                <p className="text-4xl font-extrabold text-white">{overallProgress}%</p>
              </div>
              <div className="border-l border-gray-700 pl-6 ml-6">
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Documents</h3>
                <p className="text-4xl font-extrabold text-white">{totalDocuments}</p>
            </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Priority</h3>
              <ul>
                {PRIORITY.map(priority => (
                  <li key={priority} className="text-white text-sm">
                    <span className="font-semibold">{priority}</span>
                    <span className="ml-2 text-blue-300">{priorityCounts[priority] || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Status</h3>
              <ul>
                {DOC_STATUS.map(status => (
                  <li key={status} className="text-white text-sm">
                    <span className="font-semibold">{status}</span>
                    <span className="ml-2 text-blue-300">{statusCounts[status] || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Progress</h3>
              <ul>
                {PROGRESS_STATUS.map(progress => (
                  <li key={progress} className="text-white text-sm">
                    <span className="font-semibold">{progress}</span>
                    <span className="ml-2 text-blue-300">{progressCounts[progress] || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-brand-dark/90 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-gray2">
                <div className="p-4 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-white">
                      {editData ? 'Edit Document' : 'Add New Document'}
                    </h2>
                    <button
                      onClick={handleFormClose}
                      className="text-brand-white hover:text-brand-gray2 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <BusinessDocumentForm 
                    onAdd={handleFormSubmit} 
                    onClose={handleFormClose} 
                    editData={editData ?? undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <div className="w-full px-0 py-0 mb-1 bg-brand-dark/15 rounded-lg shadow overflow-hidden">
            <BusinessDocumentTable
              documents={documents}
              loading={loading}
              onEdit={handleEdit}
              refresh={fetchDocuments}
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 