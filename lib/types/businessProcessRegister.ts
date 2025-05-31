export interface BusinessProcessRegister {
  id: number;
  businessArea: string;
  subBusinessArea: string;
  processName: string;
  documentName: string;
  version: string;
  progress: string;
  docStatus: string;
  statusPrecentage: number;
  priority: string;
  targetDate: Date;
  processOwner: string;
  updateDate: Date;
  remarks: string;
  reviewDate: Date;
}

export type BusinessProcessRegisterInput = Omit<BusinessProcessRegister, 'id'>; 