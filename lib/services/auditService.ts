import { deleteFileFromS3 } from './s3Service';

/**
 * Service for handling audit trails and file cleanup during soft deletes
 */

export interface AuditLogEntry {
  id: number;
  tableName: string;
  recordId: number;
  action: 'DELETE' | 'UPDATE' | 'CREATE';
  deletedBy: number;
  deletedAt: Date;
  businessArea?: string;
  fileName?: string;
  fileUrl?: string;
}

/**
 * Handles file cleanup when a record is soft deleted
 * @param fileUrl - The S3 URL of the file to delete
 * @param fileName - The name of the file for logging
 * @returns Promise<boolean> - Success status
 */
export const cleanupFileOnSoftDelete = async (
  fileUrl: string | null | undefined,
  fileName?: string
): Promise<boolean> => {
  if (!fileUrl) {
    return true; // No file to clean up
  }

  try {
    // Extract S3 key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    console.log(`Cleaning up file: ${fileName || 'unknown'} (${key})`);
    
    await deleteFileFromS3(key);
    console.log(`Successfully deleted file: ${fileName || 'unknown'}`);
    
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${fileName || 'unknown'}:`, error);
    // Don't throw error - we don't want file deletion failures to prevent soft delete
    return false;
  }
};

/**
 * Creates an audit log entry for soft delete operations
 * @param tableName - Name of the table being deleted from
 * @param recordId - ID of the record being deleted
 * @param deletedBy - User ID who performed the deletion
 * @param businessArea - Business area of the record
 * @param fileName - Name of associated file (if any)
 * @param fileUrl - URL of associated file (if any)
 * @returns AuditLogEntry
 */
export const createAuditLogEntry = (
  tableName: string,
  recordId: number,
  deletedBy: number,
  businessArea?: string,
  fileName?: string,
  fileUrl?: string
): AuditLogEntry => {
  return {
    id: 0, // Will be set by database
    tableName,
    recordId,
    action: 'DELETE',
    deletedBy,
    deletedAt: new Date(),
    businessArea,
    fileName,
    fileUrl
  };
};

/**
 * Logs audit information to console (in production, this would go to a proper audit log)
 * @param auditEntry - The audit log entry to log
 */
export const logAuditEntry = (auditEntry: AuditLogEntry): void => {
  console.log('AUDIT LOG:', {
    timestamp: auditEntry.deletedAt.toISOString(),
    action: auditEntry.action,
    table: auditEntry.tableName,
    recordId: auditEntry.recordId,
    deletedBy: auditEntry.deletedBy,
    businessArea: auditEntry.businessArea,
    fileName: auditEntry.fileName
  });
};

/**
 * Performs complete soft delete with file cleanup and audit logging
 * @param updateFunction - Function that performs the database update
 * @param tableName - Name of the table for audit logging
 * @param recordId - ID of the record being deleted
 * @param deletedBy - User ID who performed the deletion
 * @param fileUrl - URL of file to clean up (optional)
 * @param fileName - Name of file for logging (optional)
 * @param businessArea - Business area for audit logging (optional)
 * @returns Promise with soft delete result and cleanup status
 */
export const performSoftDeleteWithAudit = async <T>(
  updateFunction: () => Promise<T>,
  tableName: string,
  recordId: number,
  deletedBy: number,
  fileUrl?: string | null,
  fileName?: string,
  businessArea?: string
): Promise<{
  result: T;
  fileCleanupSuccess: boolean;
  auditEntry: AuditLogEntry;
}> => {
  // Perform the soft delete
  const result = await updateFunction();
  
  // Clean up associated file
  const fileCleanupSuccess = await cleanupFileOnSoftDelete(fileUrl, fileName);
  
  // Create audit log entry
  const auditEntry = createAuditLogEntry(
    tableName,
    recordId,
    deletedBy,
    businessArea,
    fileName,
    fileUrl || undefined
  );
  
  // Log the audit entry
  logAuditEntry(auditEntry);
  
  return {
    result,
    fileCleanupSuccess,
    auditEntry
  };
};
