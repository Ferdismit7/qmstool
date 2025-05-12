export interface BusinessDocument {
  id: string;
  documentName: string;
  documentType: string;
  version: string;
  progress: string;
  status: string;
  statusPercentage: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  targetDate: string;
  documentOwner: string;
  updateDate: string;
  remarks: string | null;
  reviewDate: string | null;
  businessArea: string;
  subBusinessArea: string;
  nameAndNumbering: string;
} 