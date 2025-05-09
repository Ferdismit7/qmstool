'use client';

import { useState, useEffect } from 'react';
import ProcessForm from './components/ProcessForm';
import BusinessProcessTable, { BusinessProcess } from './components/BusinessProcessTable';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<BusinessProcess | null>(null);
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all processes
  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/business-processes');
      if (!response.ok) throw new Error('Failed to fetch processes');
      const data = await response.json();
      setProcesses(data);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  // Dashboard metrics
  const totalProcesses = processes.length;
  const completedProcesses = processes.filter(p => p.status === 'Completed').length;
  const inProgressProcesses = processes.filter(p => p.status === 'In progress').length;
  const criticalProcesses = processes.filter(p => p.priority === 'Critical').length;
  const overallProgress = processes.length > 0 ? Math.round(processes.reduce((sum, p) => sum + (typeof p.statusPercentage === 'number' ? p.statusPercentage : 0), 0) / processes.length) : 0;

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleFormClose = () => setShowForm(false);

  const handleFormSubmit = async (data: BusinessProcess) => {
    try {
      const method = editData ? 'PUT' : 'POST';
      const url = editData 
        ? `/api/business-processes?id=${editData.id}`
        : '/api/business-processes';

      // Prepare the data for submission
      const submitData = {
        ...data,
        id: editData?.id, // Include ID for updates
        targetDate: data.targetDate || editData?.targetDate,
        reviewDate: data.reviewDate || editData?.reviewDate,
        updateDate: new Date().toISOString().split('T')[0],
        statusPercentage: parseInt(data.statusPercentage.toString(), 10)
      };

      console.log('Submitting data:', submitData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save process');
      }
      
      setShowForm(false);
      setEditData(null); // Clear edit data after successful save
      await fetchProcesses(); // Refresh table after add/edit
    } catch (error) {
      console.error('Error saving process:', error);
      // Optionally show error to user
    }
  };

  const handleEdit = (process: BusinessProcess) => {
    // Format dates for the form
    const formattedProcess = {
      ...process,
      targetDate: process.targetDate ? new Date(process.targetDate).toISOString().split('T')[0] : '',
      reviewDate: process.reviewDate ? new Date(process.reviewDate).toISOString().split('T')[0] : '',
      updateDate: new Date(process.updateDate).toISOString().split('T')[0],
      statusPercentage: process.statusPercentage
    };
    setEditData(formattedProcess);
    setShowForm(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-gray1 via-brand-gray1 to-brand-gray1">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-brand-white"></h1>
          <button
            onClick={handleAdd}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          >
            Add New Process
          </button>
        </div>
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="bg-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-brand-gray1">
            <h3 className="text-brand-gray3 text-2xl font-extrabold mb-2 text-center">Overall Progress</h3>
            <p className="text-3xl font-extrabold text-brand-accent2 text-center">{overallProgress}%</p>
          </div>
          <div className="bg-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-brand-gray1">
            <h3 className="text-brand-gray3 text-2xl font-extrabold mb-2 text-center">Total Processes</h3>
            <p className="text-3xl font-extrabold text-brand-accent2 text-center">{totalProcesses}</p>
          </div>
          <div className="bg-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-brand-gray1">
            <h3 className="text-brand-gray3 text-2xl font-extrabold mb-2 text-center">Completed</h3>
            <p className="text-3xl font-extrabold text-brand-accent2 text-center">{completedProcesses}</p>
          </div>
          <div className="bg-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-brand-gray1">
            <h3 className="text-brand-gray3 text-2xl font-extrabold mb-2 text-center">In Progress</h3>
            <p className="text-3xl font-extrabold text-brand-accent2 text-center">{inProgressProcesses}</p>
          </div>
          <div className="bg-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-brand-gray1">
            <h3 className="text-brand-gray3 text-2xl font-extrabold mb-2 text-center">Critical Priority</h3>
            <p className="text-3xl font-extrabold text-brand-accent2 text-center">{criticalProcesses}</p>
          </div>
        </div>
        <BusinessProcessTable processes={processes} loading={loading} onEdit={handleEdit} refresh={fetchProcesses} />
        <ProcessForm isOpen={showForm} onClose={handleFormClose} onSubmit={handleFormSubmit} initialData={editData} />
      </div>
    </main>
  );
} 