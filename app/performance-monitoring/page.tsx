'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';

interface PerformanceMonitoringControl {
  id: number;
  business_area: string;
  sub_business_area: string;
  Name_reports: string;
  doc_type: string;
  priority: string;
  doc_status: string;
  progress: string;
  status_percentage: number;
  target_date: string;
  proof: string;
  frequency: string;
  responsible_persons: string;
  remarks: string;
}

export default function PerformanceMonitoringPage() {
  const router = useRouter();
  const [controls, setControls] = useState<PerformanceMonitoringControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [controlToDelete, setControlToDelete] = useState<PerformanceMonitoringControl | null>(null);
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

  const fetchControls = async () => {
    try {
      const response = await fetch('/api/performance-monitoring');
      if (!response.ok) throw new Error('Failed to fetch controls');
      const data = await response.json();
      setControls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'FINISHED':
        return 'bg-green-100 text-green-800';
      case 'ON-TRACK':
      case 'ON TRACK':
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'MINOR CHALLENGES':
      case 'ON_HOLD':
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAJOR CHALLENGES':
      case 'EXPIRED':
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toUpperCase()) {
      case 'COMPLETED':
      case 'FINISHED':
        return 'bg-green-100 text-green-800';
      case 'ON-TRACK':
      case 'ON TRACK':
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'NOT_STARTED':
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'MINOR CHALLENGES':
      case 'MAJOR CHALLENGES':
      case 'ON_HOLD':
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
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

  const handleDeleteClick = (control: PerformanceMonitoringControl) => {
    setControlToDelete(control);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!controlToDelete) return;

    try {
      const response = await fetch('/api/performance-monitoring/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: controlToDelete.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete control');
      }

      await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Performance monitoring control successfully deleted'
      });
      
      fetchControls();
      setShowDeleteModal(false);
      setControlToDelete(null);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete control'
      });
    }
  };

  const handleDropdownToggle = (controlId: number) => {
    setOpenDropdown(openDropdown === controlId ? null : controlId);
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

  const handleViewControl = (controlId: number) => {
    router.push(`/performance-monitoring/${controlId}`);
  };

  const handleEditControl = (controlId: number) => {
    router.push(`/performance-monitoring/${controlId}/edit`);
  };

  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-white">Performance Monitoring</h1>
          <p className="text-brand-gray3 mt-1">Manage your performance monitoring controls</p>
        </div>
        <Link
          href="/performance-monitoring/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiPlus size={16} />
          Add Control
        </Link>
      </div>

      {/* Performance Monitoring Controls Table */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 overflow-hidden" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div className="overflow-x-auto min-w-full flex-1" style={{ overflowY: 'auto' }}>
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-brand-gray1">
              <thead className="bg-brand-gray1 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Business Area
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Sub Business Area
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Type
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
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Target Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray3 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray1">
                {controls.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-brand-gray3">
                      No performance monitoring controls found. Create your first control to get started.
                    </td>
                  </tr>
                ) : (
                controls.map((control) => (
                  <tr 
                    key={control.id} 
                    className="hover:bg-brand-gray1/30 cursor-pointer"
                    onClick={() => router.push(`/performance-monitoring/${control.id}`)}
                  >
                      <td className="px-4 py-3 align-top">
                        <div>
                          <div className="text-sm font-medium text-brand-white">
                            {control.business_area}
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 align-top">
                        <div className="text-sm text-brand-white">
                          {control.sub_business_area}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-sm font-medium text-brand-white">
                          {control.Name_reports}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 align-top">
                        <div className="text-sm text-brand-white">
                          {control.doc_type}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(control.priority)}`}>
                          {control.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(control.doc_status)}`}>
                            {control.doc_status}
                          </span>
                          <div className="text-xs text-brand-gray3 mt-1">
                            {control.status_percentage || 0}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(control.progress)}`}>
                          {control.progress}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-brand-white align-top">
                        {control.target_date ? (() => {
                          const date = new Date(control.target_date);
                          // Adjust for timezone offset
                          const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                          const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                          return adjustedDate.toLocaleDateString('en-GB');
                        })() : 'Not set'}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-start gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/performance-monitoring/${control.id}`}
                            className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                            title="View details"
                          >
                            <FiEye size={16} />
                          </Link>
                          <Link
                            href={`/performance-monitoring/${control.id}/edit`}
                            className="p-1 text-brand-gray3 hover:text-brand-white transition-colors"
                            title="Edit monitoring"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(control)}
                            className="p-1 text-brand-gray3 hover:text-red-400 transition-colors"
                            title="Delete monitoring"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>

                        {/* Mobile Actions Dropdown */}
                        <div className="md:hidden relative">
                          <button
                            onClick={() => handleDropdownToggle(control.id)}
                            className="text-brand-gray3 hover:text-brand-white transition-colors"
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          {/* Mobile Overlay */}
                          {openDropdown === control.id && (
                            <div className="dropdown-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                              <div 
                                className="bg-brand-dark border border-brand-gray2 rounded-lg p-6 w-full max-w-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-lg font-semibold text-brand-white mb-4 text-left">
                                  Actions for &ldquo;{control.Name_reports}&rdquo;
                                </div>
                                <div className="space-y-3">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleViewControl(control.id);
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
                                      handleEditControl(control.id);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-brand-white hover:bg-brand-gray1/50 rounded-lg transition-colors"
                                  >
                                    <FiEdit2 size={18} />
                                    Edit Control
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteClick(control);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <FiTrash2 size={18} />
                                    Delete Control
                                  </button>
                                  <button
                                    onClick={() => setOpenDropdown(null)}
                                    className="w-full px-4 py-2 text-brand-gray3 hover:text-brand-white transition-colors text-left"
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
          setControlToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={controlToDelete?.Name_reports || ''}
        itemType="performance monitoring control"
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