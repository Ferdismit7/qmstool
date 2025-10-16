import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadFileParams } from '@/app/types/fileUpload';

// Create S3 client with explicit credentials from environment variables
// These are set by AWS Secrets Manager via initializeSecrets()
const s3Client = new S3Client({
  region: process.env.REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
});

export const uploadFileToS3 = async (params: UploadFileParams): Promise<{ key: string; url: string }> => {
  const { file, fileName, contentType, businessArea, documentType, recordId } = params;
  
  console.log('S3 upload started with params:', {
    fileName,
    contentType,
    businessArea,
    documentType,
    recordId,
    fileSize: file.length
  });
  
  // Get bucket name from environment variable (set by AWS Secrets Manager)
  const bucketName = process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1';
  console.log('Using S3 bucket:', bucketName);
  
  // Create organized file path
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${documentType}/${businessArea}/${recordId ? `${recordId}_` : ''}${timestamp}_${sanitizedFileName}`;
  
  console.log('Generated S3 key:', key);
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
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

  try {
    console.log('Sending S3 command...');
    await s3Client.send(command);
    console.log('S3 upload successful');
    
    // Return both the key and the public URL
    const url = `https://${bucketName}.s3.amazonaws.com/${key}`;
    
    return { key, url };
  } catch (error) {
    console.error('S3 upload failed:', error);
    console.error('S3 error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
    });
    throw error;
  }
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
  const bucketName = process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1';
  
  console.log('S3 credentials check:', {
    hasAccessKey: !!process.env.ACCESS_KEY_ID,
    hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    bucketName: bucketName
  });
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    console.log('Generated signed URL successfully');
    return signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw error;
  }
};

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const bucketName = process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1';
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
};

export const getFileUrl = (key: string): string => {
  const bucketName = process.env.S3_BUCKET_NAME || 'qms-tool-documents-qms-1';
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
};

export const getFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 