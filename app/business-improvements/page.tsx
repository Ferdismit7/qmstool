'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

interface BusinessImprovement {
  id: number;
  business_area: string;
  sub_business_area: string;
  improvement_title: string;
  improvement_type: string;
  description: string;
  business_case: string;
  expected_benefits: string;
  implementation_plan: string;
  success_criteria: string;
  responsible_person: string;
  start_date: string;
  target_completion_date: string;
  actual_completion_date: string;
  status: string;
  priority: string;
  budget_allocated: number;
  actual_cost: number;
  roi_calculation: string;
  lessons_learned: string;
  next_steps: string;
  related_processes: string;
  status_percentage: number;
  doc_status: string;
  progress: string;
  notes: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export default function BusinessImprovementsPage() {
  const router = useRouter();
  const [businessImprovements, setBusinessImprovements] = useState<BusinessImprovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessImprovementToDelete, setBusinessImprovementToDelete] = useState<BusinessImprovement | null>(null);
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



  const fetchBusinessImprovements = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/business-improvements', { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch business improvements');
      }
      const data = await response.json();
      const rows = Array.isArray(data) ? data : (data.data ?? []);
      setBusinessImprovements(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessImprovements();
  }, [fetchBusinessImprovements]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'FINISHED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'NOT_STARTED':
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'ON_HOLD':
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'TERMINATED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW':
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (businessImprovement: BusinessImprovement) => {
    setBusinessImprovementToDelete(businessImprovement);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!businessImprovementToDelete) return;

    try {
      const response = await fetch(`/api/business-improvements?id=${businessImprovementToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete business improvement');
      }

      await fetchBusinessImprovements();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Business improvement deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting business improvement:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete business improvement'
      });
    } finally {
      setShowDeleteModal(false);
      setBusinessImprovementToDelete(null);
    }
  };


  const handleViewBusinessImprovement = (businessImprovementId: number) => {
    router.push(`/business-improvements/${businessImprovementId}`);
  };

  const handleEditBusinessImprovement = (businessImprovementId: number) => {
    router.push(`/business-improvements/${businessImprovementId}/edit`);
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
          <h1 className="text-2xl font-bold text-brand-white">Business Improvements</h1>
          <p className="text-brand-gray3 mt-1">Manage and track business improvement initiatives</p>
        </div>
        <Link
          href="/business-improvements/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Improvement
        </Link>
      </div>

      {/* Business Improvements Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div className="overflow-x-auto min-w-full flex-1" style={{ overflowY: 'auto' }}>
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-brand-gray1">
              <thead className="bg-brand-gray1 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Improvement Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Business Area
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Target Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray1">
                {businessImprovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-brand-gray3">
                      No business improvements found. Create your first improvement to get started.
                    </td>
                  </tr>
                ) : (
                  businessImprovements.map((improvement) => (
                    <tr 
                      key={improvement.id} 
                      className="hover:bg-brand-gray1/30 cursor-pointer"
                      onClick={() => router.push(`/business-improvements/${improvement.id}`)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="text-sm font-medium text-brand-white">
                          {improvement.improvement_title}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div>
                          <div className="text-sm font-medium text-brand-white">
                            {improvement.business_area}
                          </div>
                          {improvement.sub_business_area && (
                            <div className="text-xs text-brand-gray3 mt-1">
                              {improvement.sub_business_area}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 align-top">
                        <div className="text-sm text-brand-white">
                          {improvement.improvement_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(improvement.priority)}`}>
                          {improvement.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top w-32">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(improvement.status)}`}>
                          {improvement.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDocStatusColor(improvement.progress)}`}>
                          {improvement.progress}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-brand-white align-top">
                        {improvement.target_completion_date ? (() => {
                          const date = new Date(improvement.target_completion_date);
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
          setBusinessImprovementToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={businessImprovementToDelete?.improvement_title || ''}
        itemType="business improvement"
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
