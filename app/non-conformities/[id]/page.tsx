'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiDownload, FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import Notification from '@/app/components/Notification';
import { useRouter } from 'next/navigation';
import { clientTokenUtils } from '@/lib/auth';
import { getAvailableVersions, getFilesToDisplay, FileVersion } from '@/lib/utils/fileVersioningUI';

interface NonConformity {
  id: number;
  business_area: string;
  sub_business_area?: string;
  nc_number?: string;
  nc_type?: string;
  description?: string;
  root_cause?: string;
  corrective_action?: string;
  responsible_person?: string;
  target_date?: string;
  completion_date?: string;
  status?: string;
  priority?: string;
  impact_level?: string;
  verification_method?: string;
  effectiveness_review?: string;
  lessons_learned?: string;
  related_documents?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
  version?: string;
  fileVersions?: FileVersion[];
}

export default function NonConformityDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [nonConformity, setNonConformity] = useState<NonConformity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFileVersion, setSelectedFileVersion] = useState<string>('current');
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
    let isMounted = true;

    const fetchNonConformity = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        // Get token for Authorization header (fallback if cookies don't work)
        let token = clientTokenUtils.getToken();
        if (!token) {
          // Retry getting token after a short delay, as it might not be immediately available on page load
          await new Promise(resolve => setTimeout(resolve, 100));
          token = clientTokenUtils.getToken();
        }

        // If no token, user might be logging out - don't make request
        if (!token) {
          return;
        }

        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/non-conformities/${id}`, {
          credentials: 'include', // Include cookies for authentication
          headers
        });

        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        if (!response.ok) {
          // If 401, check if token was cleared (user is logging out)
          if (response.status === 401) {
            const currentToken = clientTokenUtils.getToken();
            if (!currentToken) {
              // User is logging out, don't set error - just return
              return;
            }
            if (isMounted) {
              setError('You do not have permission to view this non-conformity. Please ensure you have access to the non-conformity\'s business area.');
            }
            return;
          } else if (response.status === 404) {
            if (isMounted) {
              setError('Non-conformity not found. It may have been deleted or you do not have access to it.');
            }
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            if (isMounted) {
              setError(errorData.error || 'Failed to fetch non-conformity');
            }
            return;
          }
        }
        
        const data = await response.json();
        if (data.success && isMounted) {
          setNonConformity(data.data);
        } else if (isMounted) {
          setError(data.error || 'Failed to fetch non-conformity');
        }
      } catch (error) {
        // Only set error if component is still mounted and it's not a logout-related issue
        if (isMounted) {
          const token = clientTokenUtils.getToken();
          if (token) {
            console.error('Error fetching non-conformity:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch non-conformity');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNonConformity();

    // Cleanup function to mark component as unmounted
    return () => {
      isMounted = false;
    };
  }, [params]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
      case 'ACTIVE':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
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

  const getImpactColor = (impact: string) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (fileUrl?: string) => {
    const urlToUse = fileUrl || nonConformity?.file_url;
    if (urlToUse) {
      const fileId = extractFileIdFromUrl(urlToUse);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        window.open(urlToUse, '_blank');
      }
    }
  };

  const handleView = (fileUrl?: string) => {
    const urlToUse = fileUrl || nonConformity?.file_url;
    if (urlToUse) {
      const fileId = extractFileIdFromUrl(urlToUse);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        window.open(urlToUse, '_blank');
      }
    }
  };

  // Get available versions for file dropdown
  const availableVersions = getAvailableVersions(nonConformity?.fileVersions, 'nc_version');

  // Get files to display based on selected version
  const filesToDisplay = getFilesToDisplay(
    selectedFileVersion,
    nonConformity ? {
      file_url: nonConformity.file_url,
      file_name: nonConformity.file_name,
      file_size: nonConformity.file_size,
      file_type: nonConformity.file_type
    } : null,
    nonConformity?.version,
    nonConformity?.fileVersions,
    'nc_version'
  );

  const handleDeleteConfirm = async () => {
    if (!nonConformity) return;

    try {
      const response = await fetch('/api/non-conformities/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: nonConformity.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete non-conformity');
      }

      await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Non-conformity successfully deleted'
      });
      
      // Redirect to the list page after successful deletion
      setTimeout(() => {
        router.push('/non-conformities');
      }, 1500);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete non-conformity'
      });
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

  if (!nonConformity) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Non-conformity not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/non-conformities"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to non-conformities"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Non-Conformity Details</h1>
            <p className="text-brand-gray3 mt-1">{nonConformity.nc_number || `NC-${nonConformity.id}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/non-conformities/${nonConformity.id}/edit`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
          >
            <FiEdit2 size={12} />
            Edit Non-Conformity
          </Link>
          <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiTrash2 size={12} />
          Delete Non-Conformity
        </button>
        </div>
      </div>

      {/* Non-Conformity Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Business Area</label>
                <p className="text-brand-white">{nonConformity.business_area}</p>
                {nonConformity.sub_business_area && (
                  <p className="text-sm text-brand-gray3">{nonConformity.sub_business_area}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">NC Number</label>
                <p className="text-brand-white">{nonConformity.nc_number || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">NC Type</label>
                <p className="text-brand-white">{nonConformity.nc_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(nonConformity.status || '')}`}>
                  {nonConformity.status || 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Priority & Impact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Priority & Impact
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(nonConformity.priority || '')}`}>
                  {nonConformity.priority || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Impact Level</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(nonConformity.impact_level || '')}`}>
                  {nonConformity.impact_level || 'Not set'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Responsible Person</label>
                <p className="text-brand-white">{nonConformity.responsible_person || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Dates & File Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-white border-b border-brand-gray1 pb-2">
              Dates & Files
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-gray3">Target Date</label>
                <p className="text-brand-white">
                  {nonConformity.target_date ? (() => {
                    const date = new Date(nonConformity.target_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray3">Completion Date</label>
                <p className="text-brand-white">
                  {nonConformity.completion_date ? (() => {
                    const date = new Date(nonConformity.completion_date);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                    return adjustedDate.toLocaleDateString('en-GB');
                  })() : 'Not completed'}
                </p>
              </div>
              {(nonConformity.file_name || (nonConformity.fileVersions && nonConformity.fileVersions.length > 0)) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-brand-gray3">Attached Files</label>
                    {(nonConformity.fileVersions && nonConformity.fileVersions.length > 0) && (
                      <div className="flex items-center gap-2">
                        <label htmlFor="file-version-filter" className="text-xs text-brand-gray3 whitespace-nowrap">
                          Filter by Version:
                        </label>
                        <select
                          id="file-version-filter"
                          value={selectedFileVersion}
                          onChange={(e) => setSelectedFileVersion(e.target.value)}
                          className="px-2 py-1 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                          <option value="current">Current ({nonConformity.version || 'N/A'})</option>
                          <option value="all">All Versions</option>
                          {availableVersions.map(version => (
                            <option key={version} value={version}>
                              Version {version}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {filesToDisplay.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {filesToDisplay.map((item, index) => {
                        const file = item.file;
                        const isFileVersion = 'id' in file && 'uploaded_at' in file;
                        
                        return (
                          <div key={index} className="bg-brand-gray1 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-brand-white">
                                  <FiFileText size={16} />
                                  <span className="text-sm">{file.file_name}</span>
                                  {item.version && (
                                    <span className="text-xs text-brand-gray3">
                                      (v{item.version})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  {file.file_size && (
                                    <p className="text-xs text-brand-gray3">
                                      {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  )}
                                  {isFileVersion && (file as FileVersion).uploadedBy && (
                                    <p className="text-xs text-brand-gray3">
                                      Uploaded by: {(file as FileVersion).uploadedBy?.username}
                                    </p>
                                  )}
                                  {isFileVersion && (file as FileVersion).uploaded_at && (
                                    <p className="text-xs text-brand-gray3">
                                      {new Date((file as FileVersion).uploaded_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleView(file.file_url)}
                                  className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                                  title="View document"
                                >
                                  <FiEye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDownload(file.file_url)}
                                  className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                                  title="Download document"
                                >
                                  <FiDownload size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-brand-gray1 rounded-lg p-3 mt-2">
                      <p className="text-sm text-brand-gray3">No files found for the selected version.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {nonConformity.description && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Description</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.description}
            </p>
          </div>
        )}

        {/* Root Cause */}
        {nonConformity.root_cause && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Root Cause</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.root_cause}
            </p>
          </div>
        )}

        {/* Corrective Action */}
        {nonConformity.corrective_action && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Corrective Action</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.corrective_action}
            </p>
          </div>
        )}

        {/* Verification Method */}
        {nonConformity.verification_method && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Verification Method</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.verification_method}
            </p>
          </div>
        )}

        {/* Effectiveness Review */}
        {nonConformity.effectiveness_review && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Effectiveness Review</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.effectiveness_review}
            </p>
          </div>
        )}

        {/* Lessons Learned */}
        {nonConformity.lessons_learned && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Lessons Learned</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.lessons_learned}
            </p>
          </div>
        )}

        {/* Related Documents */}
        {nonConformity.related_documents && (
          <div className="mt-6 pt-6 border-t border-brand-gray1">
            <h3 className="text-lg font-semibold text-brand-white mb-3">Related Documents</h3>
            <p className="text-brand-white bg-brand-gray1/30 p-4 rounded-lg whitespace-pre-wrap">
              {nonConformity.related_documents}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={nonConformity?.nc_number || `NC-${nonConformity?.id}` || ''}
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
