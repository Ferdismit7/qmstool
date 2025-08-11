'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import RecordKeepingSystemForm from '../../../components/RecordKeepingSystemForm';

interface RecordKeepingSystemData {
  id: number;
  business_area: string;
  sub_business_area?: string;
  record_type?: string;
  system_name?: string;
  system_description?: string;
  retention_period?: string;
  storage_location?: string;
  access_controls?: string;
  backup_procedures?: string;
  disposal_procedures?: string;
  compliance_status?: string;
  last_audit_date?: string;
  next_audit_date?: string;
  audit_findings?: string;
  corrective_actions?: string;
  responsible_person?: string;
  status_percentage?: number;
  doc_status?: string;
  progress?: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
}

export default function EditRecordKeepingSystem({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [recordKeepingSystem, setRecordKeepingSystem] = useState<RecordKeepingSystemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordKeepingSystem = async () => {
      try {
        const { id } = await params;
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/record-keeping-systems/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch record keeping system');
        }
        
        const data = await response.json();
        if (data.success) {
          setRecordKeepingSystem(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch record keeping system');
        }
      } catch (error) {
        console.error('Error fetching record keeping system:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch record keeping system');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordKeepingSystem();
  }, [params]);

  const handleUpdateRecordKeepingSystem = async (updatedRecordKeepingSystem: RecordKeepingSystemData) => {
    try {
      const { id } = await params;
      setError(null);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/record-keeping-systems/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecordKeepingSystem),
      });

      if (!response.ok) {
        throw new Error('Failed to update record keeping system');
      }

      // Redirect to the record keeping system detail page
      router.push(`/record-keeping-systems/${id}`);
    } catch (error) {
      console.error('Error updating record keeping system:', error);
      setError(error instanceof Error ? error.message : 'Failed to update record keeping system');
    }
  };

  const handleClose = () => {
    if (recordKeepingSystem) {
      router.push(`/record-keeping-systems/${recordKeepingSystem.id}`);
    } else {
      router.push('/record-keeping-systems');
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

  if (!recordKeepingSystem) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Record keeping system not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/record-keeping-systems/${recordKeepingSystem?.id || ''}`}
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to record keeping system"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Edit Record Keeping System</h1>
            <p className="text-brand-gray3 mt-1">{recordKeepingSystem.system_name || 'Record Keeping System'}</p>
          </div>
        </div>
        <Link
          href={`/record-keeping-systems/${recordKeepingSystem?.id || ''}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gray1 text-brand-white rounded-lg hover:bg-brand-gray1/80 transition-colors"
        >
          <FiX size={16} />
          Cancel
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Record Keeping System Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <RecordKeepingSystemForm
          onAdd={handleUpdateRecordKeepingSystem}
          onClose={handleClose}
          editData={recordKeepingSystem}
        />
      </div>
    </div>
  );
}
