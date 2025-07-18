export interface BusinessProcess {
  id: string;
  businessArea: string;
  subBusinessArea: string;
  processName: string;
  documentName: string;
  version: string;
  progress: string;
  status: string;
  statusPercentage: number;
  priority: 'Low' | 'Medium' | 'High';
  targetDate: string;
  processOwner: string;
  updateDate: string;
  remarks: string | null;
  reviewDate: string | null;
}

export interface BusinessProcessRegister {
  id: number;
  businessArea: string;
  subBusinessArea: string;
  processName: string;
  documentName: string;
  version: string;
  progress: string;
  docStatus: string;
  statusPercentage: number;
  priority: 'Low' | 'Medium' | 'High';
  targetDate: Date;
  processOwner: string;
  updateDate: Date;
  remarks: string;
  reviewDate: Date;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

export type BusinessProcessRegisterInput = Omit<BusinessProcessRegister, 'id'>;

// Soft delete types
export interface SoftDeleteRequest {
  id: number;
  userId: number;
}

export interface SoftDeleteResponse {
  success: boolean;
  message: string;
  deletedAt: Date;
  deletedBy: number;
}

// Constants
export const PROGRESS_STATUS = {
  COMPLETED: 'Completed',
  ON_TRACK: 'On-Track',
  MINOR_CHALLENGES: 'Minor Challenges',
  MAJOR_CHALLENGES: 'Major Challenges',
} as const;

export const DOC_STATUS = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In progress',
  NEW: 'New',
  TO_BE_REVIEWED: 'To be reviewed',
} as const;

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

// API Configuration
export const API_ENDPOINTS = {
  BUSINESS_PROCESSES: '/api/business-processes',
  SOFT_DELETE_PROCESS: '/api/business-processes/soft-delete',
} as const; 