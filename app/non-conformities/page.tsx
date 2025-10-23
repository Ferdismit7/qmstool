'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

interface NonConformity {
  id: number;
  business_area: string;
  sub_business_area: string;
  nc_number: string;
  nc_type: string;
  description: string;
  root_cause: string;
  corrective_action: string;
  responsible_person: string;
  target_date: string;
  completion_date: string;
  status: string;
  priority: string;
  impact_level: string;
  verification_method: string;
  effectiveness_review: string;
  lessons_learned: string;
  related_documents: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export default function NonConformitiesPage() {
  const router = useRouter();
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nonConformityToDelete, setNonConformityToDelete] = useState<NonConformity | null>(null);
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



  const fetchNonConformities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/non-conformities', { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch non-conformities');
      }
      const data = await response.json();
      // Support both {success,data} and array responses
      const rows = Array.isArray(data) ? data : (data.data ?? []);
      setNonConformities(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNonConformities();
  }, [fetchNonConformities]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
      case 'ACTIVE':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
      case 'CLOSED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'ON_HOLD':
        return 'bg-blue-100 text-blue-800';
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

  const getImpactColor = (impact: string) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const handleDeleteConfirm = async () => {
    if (!nonConformityToDelete) return;

    try {
      const response = await fetch(`/api/non-conformities?id=${nonConformityToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete non-conformity');
      }

      await fetchNonConformities();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Non-conformity deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting non-conformity:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete non-conformity'
      });
    } finally {
      setShowDeleteModal(false);
      setNonConformityToDelete(null);
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
          <h1 className="text-2xl font-bold text-brand-white">Non-Conformities</h1>
          <p className="text-brand-gray3 mt-1">Manage and track non-conformities</p>
        </div>
        <Link
          href="/non-conformities/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Non-Conformity
        </Link>
      </div>

      {/* Non-Conformities Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div className="overflow-x-auto min-w-full flex-1" style={{ overflowY: 'auto' }}>
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-brand-gray1">
              <thead className="bg-brand-gray1 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    NC Number
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
                    Impact
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Target Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray1">
                {nonConformities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-brand-gray3">
                      No non-conformities found. Create your first non-conformity to get started.
                    </td>
                  </tr>
                ) : (
                  nonConformities.map((nonConformity) => (
                    <tr 
                      key={nonConformity.id} 
                      className="hover:bg-brand-gray1/30 cursor-pointer"
                      onClick={() => router.push(`/non-conformities/${nonConformity.id}`)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="text-sm font-medium text-brand-white">
                          {nonConformity.nc_number}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div>
                          <div className="text-sm font-medium text-brand-white">
                            {nonConformity.business_area}
                          </div>
                          {nonConformity.sub_business_area && (
                            <div className="text-xs text-brand-gray3 mt-1">
                              {nonConformity.sub_business_area}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 align-top">
                        <div className="text-sm text-brand-white">
                          {nonConformity.nc_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(nonConformity.priority)}`}>
                          {nonConformity.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top w-32">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(nonConformity.status)}`}>
                          {nonConformity.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(nonConformity.impact_level)}`}>
                          {nonConformity.impact_level}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-brand-white align-top">
                        {nonConformity.target_date ? (() => {
                          const date = new Date(nonConformity.target_date);
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
          setNonConformityToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={nonConformityToDelete?.nc_number || ''}
        itemType="non-conformity"
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
