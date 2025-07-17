import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.REGION || 'eu-north-1',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
  });

export interface UploadFileParams {
  file: Buffer;
  fileName: string;
  contentType: string;
  businessArea: string;
  documentType: 'business-processes' | 'business-documents' | 'quality-objectives' | 'performance-monitoring' | 'risk-management';
  recordId?: number; // Optional record ID for better organization
}

export const uploadFileToS3 = async (params: UploadFileParams): Promise<{ key: string; url: string }> => {
  const { file, fileName, contentType, businessArea, documentType, recordId } = params;
  
  // Create organized file path
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${documentType}/${businessArea}/${recordId ? `${recordId}_` : ''}${timestamp}_${sanitizedFileName}`;
  
  const command = new PutObjectCommand({
    Bucket: 'qms-tool-documents-qms-1',
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: {
      'business-area': businessArea,
      'document-type': documentType,
      'original-filename': fileName,
      'upload-date': new Date().toISOString(),
      'record-id': recordId?.toString() || '',
    },
  });

  await s3Client.send(command);
  
  // Return both the key and the public URL
  const url = `https://qms-tool-documents-qms-1.s3.amazonaws.com/${key}`;
  
  return { key, url };
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: 'qms-tool-documents-qms-1',
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
};

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: 'qms-tool-documents-qms-1',
    Key: key,
  });

  await s3Client.send(command);
};

export const getFileUrl = (key: string): string => {
  return `https://qms-tool-documents-qms-1.s3.amazonaws.com/${key}`;
};

export const getFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 