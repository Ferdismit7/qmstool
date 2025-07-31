'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

interface ThirdPartyEvaluation {
  id: number;
  supplier_name: string;
  business_area: string;
  evaluation_system_in_place: 'Yes' | 'No' | 'Planned';
  document_reference: string;
  last_evaluation_date: string;
  status_percentage: number;
  doc_status: 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges' | 'Not Started';
  progress: 'To be reviewed' | 'Completed' | 'In progress' | 'New';
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function ThirdPartyEvaluationsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<ThirdPartyEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<ThirdPartyEvaluation | null>(null);
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
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/third-party-evaluations');
      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }
      const data = await response.json();
      setEvaluations(data);
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

  const getEvaluationSystemColor = (system: string) => {
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

  const handleDeleteClick = (evaluation: ThirdPartyEvaluation) => {
    setEvaluationToDelete(evaluation);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!evaluationToDelete) return;

    try {
      const response = await fetch(`/api/third-party-evaluations/${evaluationToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete evaluation');
      }

      // Show success notification
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Third-party evaluation successfully deleted'
      });

      // Refresh the evaluations list
      fetchEvaluations();
      
      // Close modal
      setShowDeleteModal(false);
      setEvaluationToDelete(null);
      
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete evaluation'
      });
    }
  };

  const handleDropdownToggle = (evaluationId: number) => {
    setOpenDropdown(openDropdown === evaluationId ? null : evaluationId);
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

  const handleViewEvaluation = (evaluationId: number) => {
    router.push(`/third-party-evaluations/${evaluationId}`);
  };

  const handleEditEvaluation = (evaluationId: number) => {
    router.push(`/third-party-evaluations/${evaluationId}/edit`);
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
          <h1 className="text-2xl font-bold text-brand-white">Third-Party Evaluations</h1>
          <p className="text-brand-gray3 mt-1">Manage supplier evaluations and assessments</p>
        </div>
        <Link
          href="/third-party-evaluations/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Evaluation
        </Link>
      </div>

      {/* Evaluations Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-gray1/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Business Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  System in Place
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Last Evaluation
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
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-brand-gray3">
                    No evaluations found. Create your first evaluation to get started.
                  </td>
                </tr>
              ) : (
                evaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-brand-gray1/30">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-brand-white">
                          {evaluation.supplier_name}
                        </div>
                        {evaluation.document_reference && (
                          <div className="text-xs text-brand-gray3 mt-1">
                            Ref: {evaluation.document_reference}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-white">
                      {evaluation.business_area}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEvaluationSystemColor(evaluation.evaluation_system_in_place)}`}>
                        {evaluation.evaluation_system_in_place}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-white">
                      {evaluation.last_evaluation_date ? (() => {
                        const date = new Date(evaluation.last_evaluation_date);
                        // Adjust for timezone offset
                        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                        const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                        return adjustedDate.toLocaleDateString('en-GB');
                      })() : 'Not set'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.doc_status)}`}>
                          {evaluation.doc_status}
                        </span>
                        <span className="text-xs text-brand-gray3">
                          {evaluation.status_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(evaluation.progress)}`}>
                        {evaluation.progress}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {/* Desktop Actions */}
                      <div className="hidden md:flex items-center space-x-2">
                        <button
                          onClick={() => handleViewEvaluation(evaluation.id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditEvaluation(evaluation.id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Edit Evaluation"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(evaluation)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Evaluation"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      {/* Mobile Actions Dropdown */}
                      <div className="md:hidden relative">
                        <button
                          onClick={() => handleDropdownToggle(evaluation.id)}
                          className="text-brand-gray3 hover:text-brand-white transition-colors"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {/* Mobile Overlay */}
                        {openDropdown === evaluation.id && (
                          <div className="dropdown-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div 
                              className="bg-brand-dark border border-brand-gray2 rounded-lg p-6 w-full max-w-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h3 className="text-lg font-semibold text-brand-white mb-4">
                                Actions for &ldquo;{evaluation.supplier_name}&rdquo;
                              </h3>
                              <div className="space-y-3">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleViewEvaluation(evaluation.id);
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
                                    handleEditEvaluation(evaluation.id);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-brand-white hover:bg-brand-gray1/50 rounded-lg transition-colors"
                                >
                                  <FiEdit2 size={18} />
                                  Edit Evaluation
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClick(evaluation);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <FiTrash2 size={18} />
                                  Delete Evaluation
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
          setEvaluationToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={evaluationToDelete?.supplier_name || ''}
        itemType="third-party evaluation"
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