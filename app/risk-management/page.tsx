'use client';

import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { CenteredLoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';
import RiskManagementForm from '@/app/components/RiskManagementForm';
import RiskControlView from '@/app/components/RiskControlView';

interface RiskManagementControl {
  id: number;
  process_name: string;
  activity_description: string;
  issue_description: string;
  issue_type: string;
  inherent_risk_likeliness: number;
  inherent_risk_impact: number;
  inherent_risk_score: number;
  control_description: string;
  control_type: 'Preventive' | 'Detective' | 'Corrective';
  control_owner: string;
  control_effectiveness: 'High' | 'Medium' | 'Low';
  residual_risk_likeliness: number;
  status: 'Open' | 'Under Review' | 'Closed';
  doc_status: 'Not Started' | 'On-Track' | 'Completed' | 'Minor Challenges' | 'Major Challenges';
  created_at: string;
  updated_at: string;
  business_area: string;
  control_progress: number;
  control_target_date: string;
  residual_risk_impact: number;
  residual_risk_overall_score: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  deleted_at: string;
  deleted_by: number;
}

const statusStyles = {
  'Open': 'bg-red-500 text-white',
  'Under Review': 'bg-orange-500 text-white',
  'Closed': 'bg-green-500 text-white',
} as const;

const progressStyles = {
  'Not Started': 'bg-gray-500 text-white',
  'On-Track': 'bg-blue-500 text-white',
  'Completed': 'bg-green-500 text-white',
  'Minor Challenges': 'bg-orange-500 text-white',
  'Major Challenges': 'bg-red-500 text-white',
} as const;



export default function RiskManagementPage() {
  const [controls, setControls] = useState<RiskManagementControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingControl, setEditingControl] = useState<RiskManagementControl | undefined>();
  const [viewingControl, setViewingControl] = useState<RiskManagementControl | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [controlToDelete, setControlToDelete] = useState<RiskManagementControl | null>(null);
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

  const fetchControls = async () => {
    try {
      const response = await fetch('/api/risk-management');
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

  // Cleanup body scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleEdit = (control: RiskManagementControl) => {
    setEditingControl(control);
    setViewingControl(undefined);
    setShowForm(true);
  };

  const handleDeleteClick = (control: RiskManagementControl) => {
    setControlToDelete(control);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!controlToDelete) return;

    try {
      const response = await fetch(`/api/risk-management/soft-delete`, {
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
        message: 'Risk management control successfully deleted'
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

  const handleAddControl = () => {
    setEditingControl(undefined);
    setViewingControl(undefined);
    setShowForm(true);
  };

  const handleViewControl = (control: RiskManagementControl) => {
    setViewingControl(control);
    setEditingControl(undefined);
    setShowForm(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="min-h-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-white mb-2">Risk Management</h1>
            <p className="text-brand-gray3">Manage your risk assessment and control matrix</p>
          </div>
          <button
            onClick={handleAddControl}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-brand-white hover:bg-brand-blue/90 transition-colors"
          >
            <FaPlus /> Add Risk Control
          </button>
        </div>

        {showForm && viewingControl && (
          <RiskControlView
            control={viewingControl}
            onClose={() => {
              setShowForm(false);
              setViewingControl(undefined);
              // Restore body scrolling when modal is closed
              document.body.style.overflow = 'unset';
            }}
          />
        )}

        {showForm && editingControl && (
          <div className="mb-8 p-6 bg-brand-dark/30 rounded-lg border border-brand-gray2">
            <h2 className="text-xl font-semibold text-brand-white mb-4">Edit Risk Control</h2>
            <RiskManagementForm
              control={editingControl}
              onSuccess={() => {
                setShowForm(false);
                setEditingControl(undefined);
                fetchControls();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingControl(undefined);
              }}
            />
          </div>
        )}

        {showForm && !editingControl && !viewingControl && (
          <div className="mb-8 p-6 bg-brand-dark/30 rounded-lg border border-brand-gray2">
            <h2 className="text-xl font-semibold text-brand-white mb-4">Add New Risk Control</h2>
            <RiskManagementForm
              onSuccess={() => {
                setShowForm(false);
                fetchControls();
              }}
              onCancel={() => {
                setShowForm(false);
              }}
            />
          </div>
        )}

        {loading ? (
          <CenteredLoadingSpinner />
        ) : controls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No risk management controls found.</div>
            <button
              onClick={handleAddControl}
              className="mt-4 px-6 py-2 bg-brand-blue text-brand-white rounded-lg hover:bg-brand-blue/90 transition-colors"
            >
              Create Your First Control
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {controls.map((control) => (
              <div
                key={control.id}
                className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer"
                onClick={() => handleViewControl(control)}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-brand-white truncate">
                      {control.process_name}
                    </h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(control);
                        }}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(control);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[control.status] || 'bg-gray-500 text-white'}`}>
                      {control.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${progressStyles[control.doc_status] || 'bg-gray-500 text-white'}`}>
                      {control.doc_status}
                    </span>
                  </div>

                  {/* Risk Score */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Inherent Risk Score:</span>
                    <span className="text-lg font-bold text-brand-white">{control.inherent_risk_score}</span>
                  </div>
                </div>

                {/* Card Body - Summary */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Activity</span>
                      <p className="text-sm text-gray-200 mt-1 line-clamp-2">
                        {control.activity_description}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Issue</span>
                      <p className="text-sm text-gray-200 mt-1 line-clamp-2">
                        {control.issue_description}
                      </p>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-400">Likelihood:</span>
                        <span className="text-brand-white ml-1">{control.inherent_risk_likeliness}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Impact:</span>
                        <span className="text-brand-white ml-1">{control.inherent_risk_impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
        itemName={controlToDelete?.process_name || ''}
        itemType="risk management control"
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