import type { BusinessProcess, BusinessProcessRegister } from '../types/businessProcess';
import { DOC_STATUS, PROGRESS_STATUS } from '../types/businessProcess';

export const toBusinessProcessRegister = (process: BusinessProcess): BusinessProcessRegister => ({
  id: parseInt(process.id),
  businessArea: process.businessArea,
  subBusinessArea: process.subBusinessArea,
  processName: process.processName,
  documentName: process.documentName,
  version: process.version,
  progress: process.progress,
  docStatus: process.status,
  statusPercentage: process.statusPercentage,
  priority: process.priority,
  targetDate: new Date(process.targetDate),
  processOwner: process.processOwner,
  updateDate: new Date(process.updateDate),
  remarks: process.remarks || '',
  reviewDate: process.reviewDate ? new Date(process.reviewDate) : new Date(),
});

export const toBusinessProcess = (savedProcess: any, processesLength: number): BusinessProcess => ({
  id: savedProcess.id?.toString() ?? (processesLength + 1).toString(),
  businessArea: savedProcess.businessArea || '',
  subBusinessArea: savedProcess.subBusinessArea || '',
  processName: savedProcess.processName || '',
  documentName: savedProcess.documentName || '',
  version: savedProcess.version || '',
  progress: savedProcess.progress || '',
  status: savedProcess.status || savedProcess.docStatus || '',
  statusPercentage: savedProcess.statusPercentage ?? 0,
  priority: savedProcess.priority || 'Low',
  targetDate: savedProcess.targetDate instanceof Date
    ? savedProcess.targetDate.toISOString().split('T')[0]
    : savedProcess.targetDate || '',
  processOwner: savedProcess.processOwner || '',
  updateDate: savedProcess.updateDate instanceof Date
    ? savedProcess.updateDate.toISOString().split('T')[0]
    : savedProcess.updateDate || new Date().toISOString().split('T')[0],
  remarks: savedProcess.remarks || '',
  reviewDate: savedProcess.reviewDate instanceof Date
    ? savedProcess.reviewDate.toISOString().split('T')[0]
    : savedProcess.reviewDate || '',
});

export const calculateMetrics = (processes: BusinessProcess[]) => {
  const statusCounts = processes.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const progressCounts = processes.reduce((acc, p) => {
    acc[p.progress] = (acc[p.progress] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCounts = processes.reduce((acc, p) => {
    acc[p.priority] = (acc[p.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalProcesses: processes.length,
    completedProcesses: processes.filter(p => p.status === DOC_STATUS.COMPLETED).length,
    inProgressProcesses: processes.filter(p => p.status === DOC_STATUS.IN_PROGRESS).length,
    highPriorityProcesses: processes.filter(p => p.priority === 'High').length,
    overallProgress: processes.length > 0
      ? Math.round(processes.reduce((sum, p) => sum + (typeof p.statusPercentage === 'number' ? p.statusPercentage : 0), 0) / processes.length)
      : 0,
    statusCounts,
    progressCounts,
    priorityCounts,
  };
}; 