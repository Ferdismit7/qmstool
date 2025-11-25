'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import RecordKeepingSystemForm from '../../components/RecordKeepingSystemForm';

interface RecordKeepingSystem {
  id?: number;
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
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export default function NewRecordKeepingSystem() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAddRecordKeepingSystem = async (recordKeepingSystem: RecordKeepingSystem) => {
    try {
      setError(null);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/record-keeping-systems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recordKeepingSystem),
      });

      if (!response.ok) {
        throw new Error('Failed to create record keeping system');
      }

      const newRecordKeepingSystem = await response.json();
      
      // Redirect to the new record keeping system's detail page
      router.push(`/record-keeping-systems/${newRecordKeepingSystem.id}`);
    } catch (error) {
      console.error('Error creating record keeping system:', error);
      setError(error instanceof Error ? error.message : 'Failed to create record keeping system');
    }
  };

  const handleClose = () => {
    router.push('/record-keeping-systems');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/record-keeping-systems"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to record keeping systems"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">Add New Record Keeping System</h1>
            <p className="text-brand-gray3 mt-1">Create a new record keeping system</p>
          </div>
        </div>
        <Link
          href="/record-keeping-systems"
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiX size={12} />
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
          onAdd={handleAddRecordKeepingSystem}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
