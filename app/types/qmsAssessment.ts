/**
 * QMS Internal Self-Assessment Type Definitions
 * 
 * This file contains TypeScript interfaces for the QMS Internal Self-Assessment
 * form data structure and related types.
 */

/**
 * Assessment status options for ISO 9001 compliance
 */
export type AssessmentStatus = 'C' | 'NC' | 'OFI' | 'NA';

/**
 * Individual assessment item with status and comments
 */
export interface AssessmentItem {
  status: AssessmentStatus | '';
  comment: string;
}

/**
 * Assessment section containing multiple assessment items
 */
export interface AssessmentSection {
  [key: string]: AssessmentItem;
}

/**
 * Date range for assessment period
 */
export interface AssessmentDateRange {
  start: string;
  end: string;
}

/**
 * Complete QMS Internal Self-Assessment form data structure
 */
export interface QMSAssessmentData {
  // Metadata
  assessmentDateRange: AssessmentDateRange;
  businessArea: string;
  assessor: string;
  assessmentDate: string;
  
  // Assessment Sections
  section1: AssessmentSection; // Quality Management System & Processes
  section2: AssessmentSection; // Support – Resources, Competence, Awareness
  section3: AssessmentSection; // Operations
  section4: AssessmentSection; // Performance Monitoring & Improvement
  
  // Approvals
  assessmentConductedBy: string;
  assessorDate: string;
  approvedByGoverningBody: string;
  approvalDate: string;
}

/**
 * Assessment item definition for rendering
 */
export interface AssessmentItemDefinition {
  id: string;
  label: string;
}

/**
 * Assessment section definition for rendering
 */
export interface AssessmentSectionDefinition {
  sectionNumber: number;
  title: string;
  items: AssessmentItemDefinition[];
}

/**
 * Database Models
 */
export interface QMSAssessment {
  id: number;
  businessArea: string;
  assessorName: string;
  assessmentDate: Date;
  createdAt: Date;
  items?: QMSAssessmentItem[];
  approval?: QMSApproval;
}

export interface QMSAssessmentItem {
  id: number;
  assessmentId: number;
  section: string;
  clauseReference: string;
  itemNumber: string;
  itemDescription: string;
  status: AssessmentStatus;
  comment?: string;
}

export interface QMSApproval {
  id: number;
  assessmentId: number;
  conductedBy?: string;
  conductedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
}

export interface QMSSection {
  id: number;
  sectionNumber: string;
  title: string;
  clauseReference: string;
}

export interface QMSStatusOption {
  code: AssessmentStatus;
  meaning: string;
}

/**
 * QMS Assessment API Response
 */
export interface QMSAssessmentResponse {
  id: number;
  businessArea: string;
  assessorName: string;
  assessmentDate: string;
  createdAt: string;
  items: QMSAssessmentItem[];
  approval?: QMSApproval;
}

/**
 * QMS Assessment Summary for listing
 */
export interface QMSAssessmentSummary {
  id: number;
  businessArea: string;
  assessorName: string;
  assessmentDate: string;
  createdAt: string;
  itemCount: number;
} 