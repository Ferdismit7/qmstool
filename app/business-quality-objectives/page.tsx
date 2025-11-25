'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
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
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiPlus size={12} />
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Review Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray1">
                {objectives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-brand-gray3">
                      No business quality objectives found. Create your first objective to get started.
                    </td>
                  </tr>
                ) : (
                objectives.map((objective) => (
                  <tr 
                    key={objective.id} 
                    className="hover:bg-brand-gray1/30 cursor-pointer"
                    onClick={() => router.push(`/business-quality-objectives/${objective.id}`)}
                  >
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
                      <td className="px-4 py-3 align-top w-32">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(objective.doc_status || '')}`}>
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