'use client';

import { useState, useEffect } from 'react';
import BusinessDocumentForm from '../components/BusinessDocumentForm';
import BusinessDocumentTable from '../components/BusinessDocumentTable';
import { BusinessDocument } from '../types/businessDocument';
import { FaPlus } from 'react-icons/fa';

export default function BusinessDocumentRegistry() {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<BusinessDocument | undefined>();

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/business-documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAddDocument = async (document: BusinessDocument) => {
    try {
      const method = editingDocument ? 'PUT' : 'POST';
      const url = editingDocument 
        ? `/api/business-documents?id=${editingDocument.id}`
        : '/api/business-documents';

      // Format dates before sending to API
      const formattedDocument = {
        ...document,
        target_date: document.target_date || null,
        review_date: document.review_date || null,
        remarks: document.remarks || null,
        update_date: new Date().toISOString().split('T')[0], // Always use current date for update_date
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedDocument),
      });

      if (!response.ok) throw new Error('Failed to save document');
      
      await fetchDocuments(); // Refresh the list
      setShowForm(false);
      setEditingDocument(undefined);
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    }
  };

  const isValidDate = (date: any) => {
    if (!date) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  };

  const safeFormatDate = (date: any) => {
    if (!isValidDate(date)) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const handleEdit = (document: BusinessDocument) => {
    // Format dates safely for the form
    const formattedDocument = {
      ...document,
      target_date: safeFormatDate(document.target_date),
      review_date: safeFormatDate(document.review_date),
      update_date: safeFormatDate(document.update_date),
    };
    setEditingDocument(formattedDocument);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/business-documents?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      await fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  return (
    <div className="w-full px-2 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-brand-white">Business Document Registry</h1>
        <button
          onClick={() => {
            setEditingDocument(undefined);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Add Document
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-brand-dark/30 rounded-lg border border-brand-gray2">
          <h2 className="text-xl font-semibold text-brand-white mb-4">
            {editingDocument ? 'Edit Document' : 'Add New Document'}
          </h2>
          <BusinessDocumentForm
            onAdd={handleAddDocument}
            onClose={() => {
              setShowForm(false);
              setEditingDocument(undefined);
            }}
            editData={editingDocument}
          />
        </div>
      )}

      <BusinessDocumentTable
        documents={documents}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        refresh={fetchDocuments}
      />
    </div>
  );
} 