import { NextRequest } from 'next/server';
import { FileUploadData, FileUploadResult, FileUploadResultData } from '@/app/types/fileUpload';

/**
 * Extract file upload data from form data
 */
export const extractFileData = (formData: FormData): FileUploadData => {
  const file = formData.get('file') as File | null;
  
  if (!file) {
    return {};
  }

  return {
    file_url: `/uploads/${file.name}`, // You can customize this path
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    uploaded_at: new Date(),
  };
};

/**
 * Extract file upload data from JSON request body
 */
export const extractFileDataFromJson = (body: Record<string, unknown>): FileUploadData => {
  return {
    file_url: body.file_url as string || undefined,
    file_name: body.file_name as string || undefined,
    file_size: body.file_size ? Number(body.file_size) : undefined,
    file_type: body.file_type as string || undefined,
    uploaded_at: body.uploaded_at ? new Date(body.uploaded_at as string) : new Date(),
  };
};

/**
 * Validate file upload data
 */
export const validateFileData = (fileData: FileUploadData): { isValid: boolean; error?: string } => {
  if (fileData.file_name && !fileData.file_url) {
    return { isValid: false, error: 'File URL is required when file name is provided' };
  }
  
  if (fileData.file_url && !fileData.file_name) {
    return { isValid: false, error: 'File name is required when file URL is provided' };
  }

  if (fileData.file_size && fileData.file_size < 0) {
    return { isValid: false, error: 'File size cannot be negative' };
  }

  return { isValid: true };
};

/**
 * Prepare file data for database insertion (Prisma)
 */
export const prepareFileDataForPrisma = (fileData: FileUploadData | FileUploadResultData) => {
  const result: Record<string, unknown> = {};
  
  // Handle both FileUploadData and API response data structures
  if ('url' in fileData) {
    // API response structure
    result.file_url = fileData.url;
    result.file_name = fileData.fileName;
    result.file_size = fileData.fileSize ? BigInt(fileData.fileSize) : null;
    result.file_type = fileData.fileType;
    result.uploaded_at = new Date(fileData.uploadedAt);
  } else {
    // FileUploadData structure
    if (fileData.file_url !== undefined) result.file_url = fileData.file_url;
    if (fileData.file_name !== undefined) result.file_name = fileData.file_name;
    if (fileData.file_size !== undefined) result.file_size = fileData.file_size ? BigInt(fileData.file_size) : null;
    if (fileData.file_type !== undefined) result.file_type = fileData.file_type;
    if (fileData.uploaded_at !== undefined) result.uploaded_at = fileData.uploaded_at;
  }
  
  return result;
};

/**
 * Prepare file data for raw SQL queries
 */
export const prepareFileDataForSQL = (fileData: FileUploadData) => {
  return {
    file_url: fileData.file_url || null,
    file_name: fileData.file_name || null,
    file_size: fileData.file_size || null,
    file_type: fileData.file_type || null,
    uploaded_at: fileData.uploaded_at || new Date(),
  };
};

/**
 * Handle file upload from form data
 */
export const handleFileUpload = async (request: NextRequest): Promise<FileUploadResult> => {
  try {
    const formData = await request.formData();
    const fileData = extractFileData(formData);
    
    const validation = validateFileData(fileData);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Here you would implement actual file upload logic
    // For now, we'll just return the extracted data
    const resultData: FileUploadResultData = {
      key: fileData.file_url || '',
      url: fileData.file_url || '',
      fileName: fileData.file_name || '',
      fileSize: fileData.file_size || 0,
      fileType: fileData.file_type || '',
      uploadedAt: fileData.uploaded_at ? (typeof fileData.uploaded_at === 'string' ? fileData.uploaded_at : fileData.uploaded_at.toISOString()) : new Date().toISOString()
    };
    
    return { success: true, data: resultData };
  } catch (error) {
    console.error('Error handling file upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process file upload' 
    };
  }
};

/**
 * Handle file upload from JSON request
 * Can accept either a NextRequest (will parse body) or an already-parsed body object
 */
export const handleFileUploadFromJson = async (
  requestOrBody: NextRequest | Record<string, unknown>
): Promise<FileUploadResult> => {
  try {
    // Check if it's a NextRequest or already parsed body
    let body: Record<string, unknown>;
    if (requestOrBody instanceof NextRequest) {
      body = await requestOrBody.json();
    } else {
      body = requestOrBody;
    }
    
    const fileData = extractFileDataFromJson(body);
    
    const validation = validateFileData(fileData);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const resultData: FileUploadResultData = {
      key: fileData.file_url || '',
      url: fileData.file_url || '',
      fileName: fileData.file_name || '',
      fileSize: fileData.file_size || 0,
      fileType: fileData.file_type || '',
      uploadedAt: fileData.uploaded_at ? (typeof fileData.uploaded_at === 'string' ? fileData.uploaded_at : fileData.uploaded_at.toISOString()) : new Date().toISOString()
    };

    return { success: true, data: resultData };
  } catch (error) {
    console.error('Error handling file upload from JSON:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process file upload' 
    };
  }
};
