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
  priority: string;
  targetDate: Date;
  processOwner: string;
  updateDate: Date;
  remarks: string;
  reviewDate: Date;
}

export type BusinessProcessRegisterInput = Omit<BusinessProcessRegister, 'id'>;

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