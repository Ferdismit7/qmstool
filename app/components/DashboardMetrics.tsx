import React from 'react';

interface DashboardMetricsProps {
  totalProcesses: number;
  completedProcesses: number;
  inProgressProcesses: number;
  highPriorityProcesses: number;
  overallProgress: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalProcesses,
  completedProcesses,
  inProgressProcesses,
  highPriorityProcesses,
  overallProgress
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-brand-dark/40 p-4 rounded-lg backdrop-blur-sm border border-brand-dark/20">
        <h3 className="text-sm font-medium text-gray-400">Total Processes</h3>
        <p className="text-2xl font-semibold text-brand-white mt-1">{totalProcesses}</p>
      </div>
      
      <div className="bg-brand-dark/40 p-4 rounded-lg backdrop-blur-sm border border-brand-dark/20">
        <h3 className="text-sm font-medium text-gray-400">Completed</h3>
        <p className="text-2xl font-semibold text-green-500 mt-1">{completedProcesses}</p>
      </div>
      
      <div className="bg-brand-dark/40 p-4 rounded-lg backdrop-blur-sm border border-brand-dark/20">
        <h3 className="text-sm font-medium text-gray-400">In Progress</h3>
        <p className="text-2xl font-semibold text-blue-400 mt-1">{inProgressProcesses}</p>
      </div>
      
      <div className="bg-brand-dark p-4 rounded-lg backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-400">Priority</h3>
        <p className="text-2xl font-semibold text-red-500 mt-1">{highPriorityProcesses}</p>
      </div>
      
      <div className="bg-brand-dark/40 p-4 rounded-lg backdrop-blur-sm border border-brand-dark/20">
        <h3 className="text-sm font-medium text-gray-400">Overall Progress</h3>
        <div className="flex items-center mt-1">
          <p className="text-2xl font-semibold text-brand-white">{overallProgress}%</p>
          <div className="flex-1 ml-3 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMetrics; 