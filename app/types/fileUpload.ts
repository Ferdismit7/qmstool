/**
 * Standardized File Upload Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for file upload
 * functionality across the QMS Tool application.
 */

/**
 * Document types supported by the file upload system
 */
export type DocumentType = 
  | 'business-processes'
  | 'business-documents' 
  | 'quality-objectives'
  | 'performance-monitoring'
  | 'risk-management'
  | 'non-conformities'
  | 'record-keeping-systems'
  | 'business-improvements'
  | 'third-party-evaluations'
  | 'customer-feedback-systems'
  | 'training-sessions'
  | 'qms-assessments';

/**
 * File upload data structure used across the application
 */
export interface FileUploadData {
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: Date | string;
}

/**
 * File upload result data from API operations
 */
export interface FileUploadResultData {
  key: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

/**
 * File upload result from API operations
 */
export interface FileUploadResult {
  success: boolean;
  data?: FileUploadResultData;
  error?: string;
}

/**
 * File upload field props for components
 */
export interface FileUploadFieldProps {
  label?: string;
  value?: FileUploadData;
  onChange?: (fileData: FileUploadData) => void;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  required?: boolean;
  showPreview?: boolean;
  businessArea?: string;
  documentType?: DocumentType;
}

/**
 * File viewer props for components
 */
export interface FileViewerProps {
  fileId: string;
  fileName: string;
  fileType: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * File upload parameters for S3 service
 */
export interface UploadFileParams {
  file: Buffer;
  fileName: string;
  contentType: string;
  businessArea: string;
  documentType: DocumentType;
  recordId?: number;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * File size formatting options
 */
export interface FileSizeOptions {
  precision?: number;
  units?: string[];
}

/**
 * File type categories for UI display
 */
export type FileTypeCategory = 
  | 'document'
  | 'image'
  | 'spreadsheet'
  | 'presentation'
  | 'archive'
  | 'video'
  | 'audio'
  | 'other';

/**
 * File type information for UI display
 */
export interface FileTypeInfo {
  category: FileTypeCategory;
  icon: string;
  canViewInBrowser: boolean;
  description: string;
}

/**
 * Constants for file upload system
 */
export const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/rtf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  ACCEPTED_EXTENSIONS: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp',
  VIEWABLE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/html'
  ]
} as const;

/**
 * Document type mappings for business areas
 */
export const DOCUMENT_TYPE_MAPPINGS: Record<DocumentType, string> = {
  'business-processes': 'Business Processes',
  'business-documents': 'Business Documents',
  'quality-objectives': 'Quality Objectives',
  'performance-monitoring': 'Performance Monitoring',
  'risk-management': 'Risk Management',
  'non-conformities': 'Non-Conformities',
  'record-keeping-systems': 'Record Keeping Systems',
  'business-improvements': 'Business Improvements',
  'third-party-evaluations': 'Third Party Evaluations',
  'customer-feedback-systems': 'Customer Feedback Systems',
  'training-sessions': 'Training Sessions',
  'qms-assessments': 'QMS Assessments'
} as const;
