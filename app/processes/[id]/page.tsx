'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';

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

export default function BusinessProcessDetailPage() {
  const [process, setProcess] = useState<BusinessProcess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const id = window.location.pathname.split('/').pop();
        
        if (!id) {
          throw new Error('No process ID provided');
        }

        const response = await fetch(`/api/business-processes/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch business process');
        }
        
        const data = await response.json();
        setProcess(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcess();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Business process not found'}</p>
        <Link
          href="/processes"
          className="mt-2 inline-block text-brand-primary hover:underline"
        >
          Back to Business Processes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/processes"
            className="flex items-center gap-2 text-brand-gray3 hover:text-brand-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Business Processes
          </Link>
        </div>
        <Link
          href={`/processes/${process.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiEdit2 size={16} />
          Edit Process
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">Business Process Details</h1>
        <p className="text-brand-gray3 mt-1">View detailed information about this business process</p>
      </div>

      {/* Process Details */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Business Area
            </label>
            <p className="text-brand-white font-medium">{process.businessArea}</p>
          </div>

          {/* Sub Business Area */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Sub Business Area
            </label>
            <p className="text-brand-white">
              {process.subBusinessArea || 'Not specified'}
            </p>
          </div>

          {/* Process Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Process Name
            </label>
            <p className="text-brand-white font-medium">{process.processName}</p>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Name
            </label>
            <p className="text-brand-white">
              {process.documentName || 'Not specified'}
            </p>
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Version
            </label>
            <p className="text-brand-white">
              {process.version || 'Not specified'}
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Priority
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(process.priority || '')}`}>
              {process.priority || 'Not set'}
            </span>
          </div>

          {/* Status Percentage */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Status Percentage
            </label>
            <p className="text-brand-white font-medium">{process.statusPercentage || 0}%</p>
          </div>

          {/* Document Status */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Document Status
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(process.docStatus || '')}`}>
              {process.docStatus || 'Not set'}
            </span>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Progress
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(process.progress || '')}`}>
              {process.progress || 'Not set'}
            </span>
          </div>

          {/* Process Owner */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Process Owner
            </label>
            <p className="text-brand-white">
              {process.processOwner || 'Not specified'}
            </p>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Target Date
            </label>
            <p className="text-brand-white">
              {process.targetDate ? (() => {
                const date = new Date(process.targetDate);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>

          {/* Update Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Last Updated
            </label>
            <p className="text-brand-white">
              {process.updateDate ? (() => {
                const date = new Date(process.updateDate);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>

          {/* Review Date */}
          <div>
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Review Date
            </label>
            <p className="text-brand-white">
              {process.reviewDate ? (() => {
                const date = new Date(process.reviewDate);
                // Adjust for timezone offset
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
                return adjustedDate.toLocaleDateString('en-GB');
              })() : 'Not set'}
            </p>
          </div>
        </div>

        {/* Remarks */}
        {process.remarks && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-gray3 mb-2">
              Remarks
            </label>
            <div className="bg-brand-gray1 rounded-lg p-4">
              <p className="text-brand-white whitespace-pre-wrap">{process.remarks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 