import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface UploadFileParams {
  file: Buffer;
  fileName: string;
  contentType: string;
  businessArea: string;
  documentType: string;
}

export const uploadFileToS3 = async (params: UploadFileParams): Promise<string> => {
  const { file, fileName, contentType, businessArea, documentType } = params;
  
  const key = `documents/${businessArea}/${documentType}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: {
      'business-area': businessArea,
      'document-type': documentType,
      'upload-date': new Date().toISOString(),
    },
  });

  await s3Client.send(command);
  return key;
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
};

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });

  await s3Client.send(command);
}; 