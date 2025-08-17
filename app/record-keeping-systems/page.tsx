'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/auth';

interface RecordKeepingSystem {
  id: number;
  business_area: string;
  sub_business_area: string;
  record_type: string;
  system_name: string;
  system_description: string;
  retention_period: string;
  storage_location: string;
  access_controls: string;
  backup_procedures: string;
  disposal_procedures: string;
  compliance_status: string;
  last_audit_date: string;
  next_audit_date: string;
  audit_findings: string;
  corrective_actions: string;
  responsible_person: string;
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

export default function RecordKeepingSystemsPage() {
  const router = useRouter();
  const [recordKeepingSystems, setRecordKeepingSystems] = useState<RecordKeepingSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordKeepingSystemToDelete, setRecordKeepingSystemToDelete] = useState<RecordKeepingSystem | null>(null);
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

  const fetchRecordKeepingSystems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.get('/api/record-keeping-systems');
      
      if (!response.ok) {
        throw new Error('Failed to fetch record keeping systems');
      }
      
      const data = await response.json();
      if (data.success) {
        setRecordKeepingSystems(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch record keeping systems');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordKeepingSystems();
  }, [fetchRecordKeepingSystems]);

  const handleDelete = async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/record-keeping-systems/${id}/soft-delete`);
      
      if (!response.ok) {
        throw new Error('Failed to delete record keeping system');
      }
      
      const data = await response.json();
      if (data.success) {
        setRecordKeepingSystems(prev => prev.filter(system => system.id !== id));
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Record keeping system deleted successfully'
        });
      } else {
        throw new Error(data.error || 'Failed to delete record keeping system');
      }
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'An error occurred'
      });
    } finally {
      setShowDeleteModal(false);
      setRecordKeepingSystemToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLIANT':
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'NON_COMPLIANT':
      case 'INCOMPLETE':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW':
      case 'AUDIT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toUpperCase()) {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchRecordKeepingSystems()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Record Keeping Systems
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all record keeping systems in the organization.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => router.push('/record-keeping-systems/new')}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Add Record Keeping System
          </button>
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      System Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Business Area
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Record Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Progress
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Audit
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {recordKeepingSystems.map((system) => (
                    <tr key={system.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {system.system_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {system.business_area}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {system.record_type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(system.compliance_status)}`}>
                          {system.compliance_status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getProgressColor(system.progress)}`}>
                          {system.progress}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(system.last_audit_date)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === system.id ? null : system.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {openDropdown === system.id && (
                            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    router.push(`/record-keeping-systems/${system.id}`);
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    router.push(`/record-keeping-systems/${system.id}/edit`);
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    setRecordKeepingSystemToDelete(system);
                                    setShowDeleteModal(true);
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordKeepingSystemToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                             <p className="text-sm text-gray-500 mb-4">
                 Are you sure you want to delete &quot;{recordKeepingSystemToDelete.system_name}&quot;? This action cannot be undone.
               </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRecordKeepingSystemToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(recordKeepingSystemToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.isOpen && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-sm">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification({ ...notification, isOpen: false })}
                className="inline-flex text-white hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
