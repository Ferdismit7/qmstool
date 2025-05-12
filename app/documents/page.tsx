'use client';

import { useState, useEffect } from 'react';
import BusinessDocumentForm from '../components/BusinessDocumentForm';
import BusinessDocumentTable from '../components/BusinessDocumentTable';
import { BusinessDocument } from '../types/businessDocument';

export default function DocumentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<BusinessDocument | null>(null);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/business-documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
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
  const overallProgress = documents.length > 0 ? Math.round(documents.reduce((sum, d) => sum + (typeof d.statusPercentage === 'number' ? d.statusPercentage : 0), 0) / documents.length) : 0;

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
    const formattedDocument = {
      ...document,
      targetDate: document.targetDate ? new Date(document.targetDate).toISOString().split('T')[0] : '',
      reviewDate: document.reviewDate ? new Date(document.reviewDate).toISOString().split('T')[0] : '',
      updateDate: new Date(document.updateDate).toISOString().split('T')[0],
      statusPercentage: document.statusPercentage
    };
    setEditData(formattedDocument);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-brand-gray1">
      <div className="w-full py-8">
        <div className="container mx-auto px-1 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-brand-white">Business Document Registry</h1>
            <button
              onClick={handleAdd}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Document
            </button>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-brand-dark p-4 rounded-lg shadow">
              <h3 className="text-brand-white text-sm font-medium mb-2">Overall Progress</h3>
              <p className="text-blue-400 text-2xl font-bold">{overallProgress}%</p>
            </div>
            <div className="bg-brand-dark p-4 rounded-lg shadow">
              <h3 className="text-brand-white text-sm font-medium mb-2">Total Documents</h3>
              <p className="text-brand-white text-2xl font-bold">{totalDocuments}</p>
            </div>
            <div className="bg-brand-dark p-4 rounded-lg shadow">
              <h3 className="text-brand-white text-sm font-medium mb-2">Completed</h3>
              <p className="text-green-500 text-2xl font-bold">{completedDocuments}</p>
            </div>
            <div className="bg-brand-dark p-4 rounded-lg shadow">
              <h3 className="text-brand-white text-sm font-medium mb-2">In Progress</h3>
              <p className="text-orange-400 text-2xl font-bold">{inProgressDocuments}</p>
            </div>
            <div className="bg-brand-dark p-4 rounded-lg shadow">
              <h3 className="text-brand-white text-sm font-medium mb-2">Critical</h3>
              <p className="text-red-500 text-2xl font-bold">{criticalDocuments}</p>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-brand-dark/90 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-gray2">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-brand-white">
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
          <div className="bg-brand-dark rounded-lg shadow overflow-hidden">
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
  );
} 