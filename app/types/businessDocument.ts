export interface BusinessDocument {
  id: number;
  business_area: string;
  sub_business_area: string;
  document_name: string;
  name_and_numbering: string;
  document_type: string;
  version: string;
  progress: string;
  doc_status: string;
  status_percentage: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  target_date: string | null;
  document_owner: string;
  update_date: string;
  remarks: string | null;
  review_date: string | null;
  // File upload fields
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: string;
} 