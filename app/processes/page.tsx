'use client';

import { useState, useEffect } from 'react';
import ProcessForm from '../components/ProcessForm';
import BusinessProcessTable from '../components/BusinessProcessTable';
import type { BusinessProcess, BusinessProcessRegister, BusinessProcessRegisterInput } from '../lib/types/businessProcess';
import { toBusinessProcessRegister, toBusinessProcess, calculateMetrics } from '../lib/utils/businessProcess';
import businessProcessService from '../lib/services/businessProcessService';
import { DOC_STATUS, PRIORITY, PROGRESS_STATUS } from '../lib/types/businessProcess';

export default function ProcessesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<BusinessProcessRegister | undefined>(undefined);
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await businessProcessService.fetchAll();
      setProcesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch processes');
      console.error('Error fetching processes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const handleAdd = () => {
    setEditData(undefined);
    setShowForm(true);
  };

  const handleEdit = (process: BusinessProcess) => {
    const latest = processes.find(p => p.id === process.id);
    setEditData(toBusinessProcessRegister(latest || process));
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditData(undefined);
  };

  const handleFormSubmit = async (formData: BusinessProcessRegisterInput) => {
    setError(null);
    try {
      const savedProcess = await businessProcessService.save(formData, editData?.id);
      const completeProcess = toBusinessProcess(savedProcess, processes.length);

      setShowForm(false);
      if (editData) {
        setProcesses(prevProcesses =>
          prevProcesses.map(p => p.id === String(editData.id) ? { ...p, ...completeProcess } : p)
        );
        setEditData(undefined);
      } else {
        setProcesses(prevProcesses => [...prevProcesses, completeProcess]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save process');
      console.error('Error saving process:', error);
    }
  };

  const metrics = calculateMetrics(processes);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-brand-white">Business Process Registry</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Process
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Overall Progress</h3>
            <p className="text-4xl font-extrabold text-white">{metrics.overallProgress}%</p>
          </div>
          <div className="border-l border-gray-700 pl-6 ml-6">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Processes</h3>
            <p className="text-4xl font-extrabold text-white">{metrics.totalProcesses}</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Priority</h3>
          <ul>
            {Object.values(PRIORITY).map(priority => (
              <li key={priority} className="text-white text-sm">
                <span className="font-semibold">{priority}</span>
                <span className="ml-2 text-blue-300">{metrics.priorityCounts[priority] || 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Status</h3>
          <ul>
            {Object.values(DOC_STATUS).map(status => (
              <li key={status} className="text-white text-sm">
                <span className="font-semibold">{status}</span>
                <span className="ml-2 text-blue-300">{metrics.statusCounts[status] || 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Progress</h3>
          <ul>
            {Object.values(PROGRESS_STATUS).map(progress => (
              <li key={progress} className="text-white text-sm">
                <span className="font-semibold">{progress}</span>
                <span className="ml-2 text-blue-300">{metrics.progressCounts[progress] || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BusinessProcessTable
        processes={processes}
        loading={loading}
        onEdit={handleEdit}
        refresh={fetchProcesses}
      />

      {showForm && (
        <ProcessForm
          process={editData}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      )}
    </div>
  );
} 