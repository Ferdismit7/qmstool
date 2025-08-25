'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';

interface BusinessProcess {
  id: number;
  businessArea: string;
  subBusinessArea?: string;
  processName: string;
  documentName?: string;
  version?: string;
  progress?: string;
  docStatus?: string;
  statusPercentage?: number;
  priority?: string;
  targetDate?: string;
  processOwner?: string;
  updateDate?: string;
  remarks?: string;
  reviewDate?: string;
}

export default function ProcessesPage() {
  const router = useRouter();
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<BusinessProcess | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
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

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/business-processes');
      if (!response.ok) {
        throw new Error('Failed to fetch business processes');
      }
      const data = await response.json();
      setProcesses(data);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (process: BusinessProcess) => {
    setProcessToDelete(process);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!processToDelete) return;

    try {
      const response = await fetch('/api/business-processes/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: processToDelete.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete business process');
      }

      // Show success notification
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Business process successfully deleted'
      });

      // Refresh the processes list
      fetchProcesses();
      
      // Close modal
      setShowDeleteModal(false);
      setProcessToDelete(null);
      
    } catch (error) {
      console.error('Error deleting business process:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete business process'
      });
    }
  };

  const handleDropdownToggle = (processId: number) => {
    setOpenDropdown(openDropdown === processId ? null : processId);
  };

  const handleViewProcess = (processId: number) => {
    console.log('View process clicked:', processId);
    setOpenDropdown(null);
    router.push(`/processes/${processId}`);
  };

  const handleEditProcess = (processId: number) => {
    console.log('Edit process clicked:', processId);
    setOpenDropdown(null);
    router.push(`/processes/${processId}/edit`);
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
          <h1 className="text-2xl font-bold text-brand-white">Business Process Registry</h1>
          <p className="text-brand-gray3 mt-1">Manage and track all business processes</p>
        </div>
        <Link
          href="/processes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Process
        </Link>
      </div>

      {/* Business Processes Table */}
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
                  Process Name
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Document
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Progress
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Target Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray1">
              {processes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-brand-gray3">
                    No business processes found. Create your first process to get started.
                  </td>
                </tr>
              ) : (
                processes.map((process) => (
                  <tr key={process.id} className="hover:bg-brand-gray1/30">
                    <td className="px-4 py-3 align-top">
                      <div>
                        <div className="text-sm font-medium text-brand-white">
                          {process.businessArea}
                        </div>
                        {process.subBusinessArea && (
                          <div className="text-xs text-brand-gray3 mt-1">
                            {process.subBusinessArea}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-medium text-brand-white">
                        {process.processName}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 align-top">
                      <div>
                        <div className="text-sm text-brand-white">
                          {process.documentName || 'Not specified'}
                        </div>
                        {process.version && (
                          <div className="text-xs text-brand-gray3 mt-1">
                            v{process.version}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 align-top">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(process.priority || '')}`}>
                        {process.priority || 'Not set'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(process.docStatus || '')}`}>
                          {process.docStatus || 'Not set'}
                        </span>
                        <div className="text-xs text-brand-gray3 mt-1">
                          {process.statusPercentage || 0}%
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(process.progress || '')}`}>
                        {process.progress || 'Not set'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-brand-white align-top">
                      {process.targetDate ? (() => {
                        const date = new Date(process.targetDate);
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
                          href={`/processes/${process.id}`}
                          className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                          title="View details"
                        >
                          <FiEye size={16} />
                        </Link>
                        <Link
                          href={`/processes/${process.id}/edit`}
                          className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                          title="Edit process"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(process)}
                          className="p-1 text-brand-gray3 hover:text-red-400 transition-colors"
                          title="Delete process"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                                              {/* Mobile view - dropdown menu */}
                        <div className="md:hidden relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDropdownToggle(process.id);
                            }}
                            className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                            title="More actions"
                          >
                            <FiMoreVertical size={16} />
                          </button>
                          
                          {openDropdown === process.id && (
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
                                      Actions for &ldquo;{process.processName}&rdquo;
                                    </div>
                                    <div className="space-y-2">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          console.log('View button clicked for process:', process.id);
                                          handleViewProcess(process.id);
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
                                          console.log('Edit button clicked for process:', process.id);
                                          handleEditProcess(process.id);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-brand-white hover:bg-brand-gray1 transition-colors rounded-lg w-full text-left"
                                      >
                                        <FiEdit2 size={18} />
                                        <span className="text-base">Edit Process</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(process);
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-brand-gray1 transition-colors rounded-lg w-full text-left"
                                      >
                                        <FiTrash2 size={18} />
                                        <span className="text-base">Delete Process</span>
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
          setProcessToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={processToDelete?.processName || ''}
        itemType="business process"
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