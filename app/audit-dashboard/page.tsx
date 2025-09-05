'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface DeletedRecord {
  id: number;
  tableName: string;
  recordId: number;
  deletedAt: string;
  deletedBy: number;
  businessArea?: string;
  fileName?: string;
  deletedByUser?: {
    username: string;
    email: string;
  };
}

export default function AuditDashboard() {
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchDeletedRecords();
  }, [selectedTable]);

  const fetchDeletedRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit/deleted-records');
      
      if (!response.ok) {
        throw new Error('Failed to fetch deleted records');
      }
      
      const data = await response.json();
      setDeletedRecords(data.deletedRecords || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTableDisplayName = (tableName: string): string => {
    const tableNames: { [key: string]: string } = {
      'businessdocumentregister': 'Business Documents',
      'businessprocessregister': 'Business Processes',
      'businessqualityobjectives': 'Quality Objectives',
      'performancemonitoringcontrol': 'Performance Monitoring',
      'racm_matrix': 'Risk Management',
      'non_conformities': 'Non-Conformities',
      'record_keeping_systems': 'Record Keeping Systems',
      'business_improvements': 'Business Improvements',
      'trainingsessions': 'Training Sessions',
      'third_party_evaluations': 'Third Party Evaluations',
      'customer_feedback_systems': 'Customer Feedback Systems',
      'qms_assessments': 'QMS Assessments'
    };
    return tableNames[tableName] || tableName;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const filteredRecords = selectedTable === 'all' 
    ? deletedRecords 
    : deletedRecords.filter(record => record.tableName === selectedTable);

  const uniqueTables = Array.from(new Set(deletedRecords.map(record => record.tableName)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
              <p className="mt-2 text-gray-600">
                View all deleted records and audit trails
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="table-filter" className="text-sm font-medium text-gray-700">
              Filter by table:
            </label>
            <select
              id="table-filter"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tables</option>
              {uniqueTables.map(table => (
                <option key={table} value={table}>
                  {getTableDisplayName(table)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Deleted Records
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {deletedRecords.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tables Affected
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {uniqueTables.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Records with Files
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {deletedRecords.filter(r => r.fileName).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deleted Records Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Deleted Records ({filteredRecords.length})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All records that have been soft deleted from the system
            </p>
          </div>
          
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deleted records</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedTable === 'all' 
                  ? 'No records have been deleted yet.' 
                  : `No records have been deleted from ${getTableDisplayName(selectedTable)}.`
                }
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <li key={`${record.tableName}-${record.recordId}`}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getTableDisplayName(record.tableName)} #{record.recordId}
                          </p>
                          {record.fileName && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              File: {record.fileName}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Deleted by:</span> {record.deletedByUser?.username || `User #${record.deletedBy}`}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {formatDate(record.deletedAt)}
                          </div>
                          {record.businessArea && (
                            <div>
                              <span className="font-medium">Business Area:</span> {record.businessArea}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Deleted
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
