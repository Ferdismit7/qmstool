'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

interface BusinessQualityObjective {
  id: number;
  category: string;
  business_area: string;
  sub_business_area: string;
  qms_main_objectives: string;
  qms_objective_description: string;
  kpi_or_sla_targets: string;
  performance_monitoring: string;
  proof_of_measuring: string;
  proof_of_reporting: string;
  frequency: string;
  responsible_person_team: string;
  review_date: string;
  progress: string;
  status_percentage: number;
  doc_status: string;
}

export default function BusinessQualityObjectivesPage() {
  const router = useRouter();
  const [objectives, setObjectives] = useState<BusinessQualityObjective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState<BusinessQualityObjective | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  const fetchObjectives = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/business-quality-objectives');
      if (!response.ok) {
        throw new Error('Failed to fetch objectives');
      }
      const data = await response.json();
      
      // Handle the API response structure: { success: true, data: objectives }
      if (data.success && Array.isArray(data.data)) {
        setObjectives(data.data);
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        setObjectives(data);
      } else {
        setObjectives([]);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch objectives');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjectives();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TO_BE_REVIEWED':
        return 'bg-yellow-100 text-yellow-800';
      case 'NEW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800';
      case 'MINOR_CHALLENGES':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAJOR_CHALLENGES':
        return 'bg-red-100 text-red-800';
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (objective: BusinessQualityObjective) => {
    setObjectiveToDelete(objective);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!objectiveToDelete) return;

    try {
      const response = await fetch('/api/business-quality-objectives/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: objectiveToDelete.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete objective');
      }

      await fetchObjectives();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Objective deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting objective:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete objective'
      });
    } finally {
      setShowDeleteModal(false);
      setObjectiveToDelete(null);
    }
  };

  const handleDropdownToggle = (objectiveId: number) => {
    setOpenDropdown(openDropdown === objectiveId ? null : objectiveId);
  };

  const handleViewObjective = (objectiveId: number) => {
    console.log('View objective clicked:', objectiveId);
    setOpenDropdown(null);
    router.push(`/business-quality-objectives/${objectiveId}`);
  };

  const handleEditObjective = (objectiveId: number) => {
    console.log('Edit objective clicked:', objectiveId);
    setOpenDropdown(null);
    router.push(`/business-quality-objectives/${objectiveId}/edit`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the dropdown
      const target = event.target as Element;
      if (target.closest('.dropdown-overlay')) {
        return;
      }
      
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

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
          <h1 className="text-2xl font-bold text-brand-white">Business Quality Objectives</h1>
          <p className="text-brand-gray3 mt-1">Manage and track your business quality objectives and KPIs</p>
        </div>
        <Link
          href="/business-quality-objectives/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Objective
        </Link>
      </div>

      {/* Business Quality Objectives Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div className="overflow-x-auto min-w-full flex-1" style={{ overflowY: 'auto' }}>
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-brand-gray1">
              <thead className="bg-brand-gray1 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Business Area
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Main Objectives
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Responsible
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Review Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray1">
                {objectives.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-brand-gray3">
                      No business quality objectives found. Create your first objective to get started.
                    </td>
                  </tr>
                ) : (
                  objectives.map((objective) => (
                    <tr key={objective.id} className="hover:bg-brand-gray1/30">
                      <td className="px-4 py-3 align-top">
                        <div>
                          <div className="text-sm font-medium text-brand-white">
                            {objective.business_area}
                          </div>
                          {objective.sub_business_area && (
                            <div className="text-xs text-brand-gray3 mt-1">
                              {objective.sub_business_area}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-sm font-medium text-brand-white">
                          {objective.category}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 align-top">
                        <div className="text-sm text-brand-white">
                          {objective.qms_main_objectives ? 
                            (objective.qms_main_objectives.length > 50 ? 
                              `${objective.qms_main_objectives.substring(0, 50)}...` : 
                              objective.qms_main_objectives
                            ) : 'Not specified'
                          }
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 align-top">
                        <div className="text-sm text-brand-white">
                          {objective.responsible_person_team || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(objective.doc_status || '')}`}>
                            {objective.doc_status || 'Not set'}
                          </span>
                          <div className="text-xs text-brand-gray3 mt-1">
                            {objective.status_percentage || 0}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(objective.progress || '')}`}>
                          {objective.progress || 'Not set'}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-brand-white align-top">
                        {objective.review_date ? (() => {
                          const date = new Date(objective.review_date);
                          // Adjust for timezone offset
                          const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                          const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                          return adjustedDate.toLocaleDateString('en-GB');
                        })() : 'Not set'}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {/* Desktop view - always visible icons */}
                        <div className="hidden md:flex items-start gap-2">
                          <Link
                            href={`/business-quality-objectives/${objective.id}`}
                            className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                            title="View details"
                          >
                            <FiEye size={16} />
                          </Link>
                          <Link
                            href={`/business-quality-objectives/${objective.id}/edit`}
                            className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                            title="Edit objective"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(objective)}
                            className="p-1 text-brand-gray3 hover:text-red-400 transition-colors"
                            title="Delete objective"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>

                        {/* Mobile view - dropdown menu */}
                        <div className="md:hidden relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDropdownToggle(objective.id);
                            }}
                            className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                            title="More actions"
                          >
                            <FiMoreVertical size={16} />
                          </button>
                          
                          {openDropdown === objective.id && (
                            <>
                              {/* Overlay backdrop */}
                              <div 
                                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                onClick={() => setOpenDropdown(null)}
                              />
                              {/* Dropdown overlay */}
                              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dropdown-overlay">
                                <div 
                                  className="bg-brand-gray2 border border-brand-gray1 rounded-lg shadow-xl w-full max-w-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="p-4">
                                    <div className="text-lg font-semibold text-brand-white mb-4 text-left">
                                      Actions for &ldquo;{objective.qms_main_objectives}&rdquo;
                                    </div>
                                    <div className="space-y-2">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          console.log('View button clicked for objective:', objective.id);
                                          handleViewObjective(objective.id);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-brand-white hover:bg-brand-gray1 transition-colors rounded-lg w-full text-left"
                                      >
                                        <FiEye size={18} />
                                        <span className="text-base">View Details</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          console.log('Edit button clicked for objective:', objective.id);
                                          handleEditObjective(objective.id);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-brand-white hover:bg-brand-gray1 transition-colors rounded-lg w-full text-left"
                                      >
                                        <FiEdit2 size={18} />
                                        <span className="text-base">Edit Objective</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(objective);
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-brand-gray1 transition-colors rounded-lg w-full text-left"
                                      >
                                        <FiTrash2 size={18} />
                                        <span className="text-base">Delete Objective</span>
                                      </button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-brand-gray1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdown(null);
                                        }}
                                        className="w-full px-4 py-2 text-brand-gray3 hover:text-brand-white transition-colors text-left"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
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
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setObjectiveToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={objectiveToDelete?.qms_main_objectives || ''}
        itemType="business quality objective"
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