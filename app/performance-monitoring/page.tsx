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
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'on-track':
      case 'on track':
        return 'bg-blue-500 text-white';
      case 'minor challenges':
        return 'bg-yellow-500 text-white';
      case 'major challenges':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'on-track':
      case 'on track':
        return 'bg-blue-500 text-white';
      case 'minor challenges':
        return 'bg-yellow-500 text-white';
      case 'major challenges':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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
    <div className="w-full px-2 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-white mb-2">Performance Monitoring</h1>
          <p className="text-brand-gray2">Manage your performance monitoring controls</p>
        </div>
        <Link
          href="/performance-monitoring/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-brand-white hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus /> Add Control
        </Link>
      </div>

      {/* Performance Monitoring Controls Table */}
      <div className="bg-brand-dark/50 rounded-lg border border-brand-gray1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-gray1/30 border-b border-brand-gray2">
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider">
                  Business Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider hidden md:table-cell">
                  Sub Business Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider hidden lg:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider hidden lg:table-cell">
                  Status %
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider hidden md:table-cell">
                  Target Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray2">
              {controls.map((control) => (
                <tr key={control.id} className="hover:bg-brand-gray1/20 transition-colors">
                  <td className="px-4 py-3 text-sm text-brand-white">
                    {control.business_area}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white hidden md:table-cell">
                    {control.sub_business_area}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white">
                    {control.Name_reports}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white hidden lg:table-cell">
                    {control.doc_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(control.priority)}`}>
                      {control.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(control.doc_status)}`}>
                      {control.doc_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgressColor(control.progress)}`}>
                      {control.progress}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white hidden lg:table-cell">
                    {control.status_percentage}%
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white hidden md:table-cell">
                    {control.target_date ? new Date(control.target_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-white">
                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-2">
                      <button
                        onClick={() => handleViewControl(control.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditControl(control.id)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Edit Control"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(control)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Control"
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
                            <h3 className="text-lg font-semibold text-brand-white mb-4">
                              Actions for &ldquo;{control.Name_reports}&rdquo;
                            </h3>
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
              ))}
            </tbody>
          </table>
        </div>

        {controls.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-brand-gray3">
              No performance monitoring controls found. Create your first control to get started.
            </p>
          </div>
        )}
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