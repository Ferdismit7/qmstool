'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

interface CustomerFeedbackSystem {
  id: number;
  business_area: string;
  has_feedback_system: 'Yes' | 'No' | 'Planned';
  document_reference: string;
  last_review_date: string;
  status_percentage: number;
  doc_status: 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started';
  progress: 'To be reviewed' | 'Completed' | 'In progress' | 'New';
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerFeedbackSystemsPage() {
  const router = useRouter();
  const [feedbackSystems, setFeedbackSystems] = useState<CustomerFeedbackSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackSystemToDelete, setFeedbackSystemToDelete] = useState<CustomerFeedbackSystem | null>(null);
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
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    fetchFeedbackSystems();
  }, []);

  const fetchFeedbackSystems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/customer-feedback-systems');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback systems');
      }
      const data = await response.json();
      setFeedbackSystems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On-Track':
        return 'bg-blue-100 text-blue-800';
      case 'Minor Challenges':
        return 'bg-yellow-100 text-yellow-800';
      case 'Major Challenges':
        return 'bg-red-100 text-red-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In progress':
        return 'bg-blue-100 text-blue-800';
      case 'To be reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'New':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeedbackSystemColor = (system: string) => {
    switch (system) {
      case 'Yes':
        return 'bg-green-100 text-green-800';
      case 'No':
        return 'bg-red-100 text-red-800';
      case 'Planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (feedbackSystem: CustomerFeedbackSystem) => {
    setFeedbackSystemToDelete(feedbackSystem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackSystemToDelete) return;

    try {
      const response = await fetch(`/api/customer-feedback-systems/${feedbackSystemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feedback system');
      }

      // Show success notification
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Customer feedback system successfully deleted'
      });

      // Refresh the feedback systems list
      fetchFeedbackSystems();
      
      // Close modal
      setShowDeleteModal(false);
      setFeedbackSystemToDelete(null);
      
    } catch (error) {
      console.error('Error deleting feedback system:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete feedback system'
      });
    }
  };

  const handleDropdownToggle = (feedbackSystemId: number) => {
    setOpenDropdown(openDropdown === feedbackSystemId ? null : feedbackSystemId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const target = event.target as Element;
        if (!target.closest('.dropdown-overlay')) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleViewFeedbackSystem = (feedbackSystemId: number) => {
    router.push(`/customer-feedback-systems/${feedbackSystemId}`);
  };

  const handleEditFeedbackSystem = (feedbackSystemId: number) => {
    router.push(`/customer-feedback-systems/${feedbackSystemId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-white">Customer Feedback Systems</h1>
          <p className="text-brand-gray3 mt-1">Manage customer feedback systems and processes</p>
        </div>
        <Link
          href="/customer-feedback-systems/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Feedback System
        </Link>
      </div>

      {/* Feedback Systems Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-gray1/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Business Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Feedback System
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Last Review
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray1">
              {feedbackSystems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-gray3">
                    No feedback systems found. Create your first feedback system to get started.
                  </td>
                </tr>
              ) : (
                feedbackSystems.map((feedbackSystem) => (
                  <tr key={feedbackSystem.id} className="hover:bg-brand-gray1/30">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-brand-white">
                          {feedbackSystem.business_area}
                        </div>
                        {feedbackSystem.document_reference && (
                          <div className="text-xs text-brand-gray3 mt-1">
                            Ref: {feedbackSystem.document_reference}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFeedbackSystemColor(feedbackSystem.has_feedback_system)}`}>
                        {feedbackSystem.has_feedback_system}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-white">
                      {feedbackSystem.last_review_date ? (() => {
                        const date = new Date(feedbackSystem.last_review_date);
                        // Adjust for timezone offset
                        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                        const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                        return adjustedDate.toLocaleDateString('en-GB');
                      })() : 'Not set'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedbackSystem.doc_status)}`}>
                          {feedbackSystem.doc_status}
                        </span>
                        <span className="text-xs text-brand-gray3">
                          {feedbackSystem.status_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(feedbackSystem.progress)}`}>
                        {feedbackSystem.progress}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {/* Desktop Actions */}
                      <div className="hidden md:flex items-center space-x-2">
                        <button
                          onClick={() => handleViewFeedbackSystem(feedbackSystem.id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditFeedbackSystem(feedbackSystem.id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Edit Feedback System"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(feedbackSystem)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Feedback System"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      {/* Mobile Actions Dropdown */}
                      <div className="md:hidden relative">
                        <button
                          onClick={() => handleDropdownToggle(feedbackSystem.id)}
                          className="text-brand-gray3 hover:text-brand-white transition-colors"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {/* Mobile Overlay */}
                        {openDropdown === feedbackSystem.id && (
                          <div className="dropdown-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div 
                              className="bg-brand-dark border border-brand-gray2 rounded-lg p-6 w-full max-w-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h3 className="text-lg font-semibold text-brand-white mb-4">
                                Actions for &ldquo;{feedbackSystem.business_area}&rdquo;
                              </h3>
                              <div className="space-y-3">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleViewFeedbackSystem(feedbackSystem.id);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-brand-white hover:bg-brand-gray1/50 rounded-lg transition-colors"
                                >
                                  <FiEye size={18} />
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditFeedbackSystem(feedbackSystem.id);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-brand-white hover:bg-brand-gray1/50 rounded-lg transition-colors"
                                >
                                  <FiEdit2 size={18} />
                                  Edit Feedback System
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClick(feedbackSystem);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <FiTrash2 size={18} />
                                  Delete Feedback System
                                </button>
                                <button
                                  onClick={() => setOpenDropdown(null)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-brand-gray3 hover:bg-brand-gray1/50 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFeedbackSystemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={feedbackSystemToDelete?.business_area || ''}
        itemType="customer feedback system"
      />

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
} 