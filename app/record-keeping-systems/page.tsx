'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

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

  const getAuthToken = () => {
    // Check sessionStorage first (default for non-remembered logins)
    let token = sessionStorage.getItem('authToken');
    // If not in sessionStorage, check localStorage (for remembered logins)
    if (!token) {
      token = localStorage.getItem('authToken');
    }
    // If still no token, check cookies (for server-side compatibility)
    if (!token) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
    return token;
  };

  const fetchRecordKeepingSystems = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/record-keeping-systems', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLIANT':
      case 'COMPLIANT':
        return 'bg-green-100 text-green-800';
      case 'NON_COMPLIANT':
      case 'NON-COMPLIANT':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
      case 'ONGOING':
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (recordKeepingSystem: RecordKeepingSystem) => {
    setRecordKeepingSystemToDelete(recordKeepingSystem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordKeepingSystemToDelete) return;

    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/record-keeping-systems?id=${recordKeepingSystemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete record keeping system');
      }

      await fetchRecordKeepingSystems();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Record keeping system deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting record keeping system:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete record keeping system'
      });
    } finally {
      setShowDeleteModal(false);
      setRecordKeepingSystemToDelete(null);
    }
  };

  const handleDropdownToggle = (recordKeepingSystemId: number) => {
    setOpenDropdown(openDropdown === recordKeepingSystemId ? null : recordKeepingSystemId);
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

  const handleViewRecordKeepingSystem = (recordKeepingSystemId: number) => {
    router.push(`/record-keeping-systems/${recordKeepingSystemId}`);
  };

  const handleEditRecordKeepingSystem = (recordKeepingSystemId: number) => {
    router.push(`/record-keeping-systems/${recordKeepingSystemId}/edit`);
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
          <h1 className="text-2xl font-bold text-brand-white">Record Keeping Systems</h1>
          <p className="text-brand-gray3 mt-1">Manage and track record keeping systems</p>
        </div>
        <Link
          href="/record-keeping-systems/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add System
        </Link>
      </div>

      {/* Record Keeping Systems Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-brand-gray1">
              <thead className="bg-brand-gray1/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    System Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Business Area
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Record Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Compliance Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Status %
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Next Audit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray1">
                {recordKeepingSystems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-brand-gray3">
                      No record keeping systems found. Create your first system to get started.
                    </td>
                  </tr>
                ) : (
                  recordKeepingSystems.map((system) => (
                    <tr key={system.id} className="hover:bg-brand-gray1/30">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-brand-white">
                          {system.system_name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-brand-white">
                            {system.business_area}
                          </div>
                          {system.sub_business_area && (
                            <div className="text-xs text-brand-gray3 mt-1">
                              {system.sub_business_area}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <div className="text-sm text-brand-white">
                          {system.record_type}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(system.compliance_status)}`}>
                          {system.compliance_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(system.progress)}`}>
                          {system.progress}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-brand-white">
                        {system.status_percentage}%
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-brand-white">
                        {system.next_audit_date ? (() => {
                          const date = new Date(system.next_audit_date);
                          const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                          const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                          return adjustedDate.toLocaleDateString('en-GB');
                        })() : 'Not set'}
                      </td>
                      <td className="px-4 py-3">
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center space-x-2">
                          <button
                            onClick={() => handleViewRecordKeepingSystem(system.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditRecordKeepingSystem(system.id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Edit System"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(system)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete System"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>

                        {/* Mobile Actions Dropdown */}
                        <div className="md:hidden relative">
                          <button
                            onClick={() => handleDropdownToggle(system.id)}
                            className="text-brand-gray3 hover:text-brand-white transition-colors"
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          {/* Mobile Overlay */}
                          {openDropdown === system.id && (
                            <div className="dropdown-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                              <div 
                                className="bg-brand-dark border border-brand-gray2 rounded-lg p-6 w-full max-w-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h3 className="text-lg font-semibold text-brand-white mb-4">
                                  Actions for &ldquo;{system.system_name}&rdquo;
                                </h3>
                                <div className="space-y-3">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleViewRecordKeepingSystem(system.id);
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
                                      handleEditRecordKeepingSystem(system.id);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-brand-white hover:bg-brand-gray1/50 rounded-lg transition-colors"
                                  >
                                    <FiEdit2 size={18} />
                                    Edit System
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteClick(system);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <FiTrash2 size={18} />
                                    Delete System
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
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRecordKeepingSystemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={recordKeepingSystemToDelete?.system_name || ''}
        itemType="record keeping system"
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
