import { NextRequest, NextResponse } from 'next/server';
import { DocumentType, FILE_UPLOAD_CONSTANTS } from '@/app/types/fileUpload';
import { initializeSecrets } from '@/lib/awsSecretsManager';

// ISO 27001 Compliant: Upload file via existing Lambda function
const uploadFileViaLambda = async (params: {
  file: Buffer;
  fileName: string;
  contentType: string;
  businessArea: string;
  documentType: DocumentType;
  recordId?: number;
}): Promise<{ key: string; url: string }> => {
  const { file, fileName, contentType, businessArea, documentType, recordId } = params;
  
  // Get existing Lambda function URL from environment variables
  const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
  
  if (!lambdaUrl) {
    throw new Error('Lambda function URL not configured');
  }
  
  console.log('Calling existing Lambda function for S3 upload...');
  
  // Convert buffer to base64 for transmission
  const fileData = file.toString('base64');
  
  const response = await fetch(lambdaUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'uploadFile',
      fileData,
      fileName,
      contentType,
      businessArea,
      documentType,
      recordId
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Lambda upload failed: ${errorData.error || 'Unknown error'}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Lambda upload failed: ${result.error || 'Unknown error'}`);
  }
  
  return result.data;
};

export async function POST(request: NextRequest) {
  try {
    console.log('Upload file API called');
    
    // Initialize secrets from AWS Secrets Manager
    await initializeSecrets();
    
    // Check environment variables with detailed logging
    console.log('Environment variables check:');
    // SECURITY FIX: Removed environment variable logging
    // console.log('- ACCESS_KEY_ID exists:', !!process.env.ACCESS_KEY_ID); // REMOVED
    // console.log('- SECRET_ACCESS_KEY exists:', !!process.env.SECRET_ACCESS_KEY); // REMOVED
    // console.log('- S3_BUCKET_NAME exists:', !!process.env.S3_BUCKET_NAME); // REMOVED
    // console.log('- REGION exists:', !!process.env.REGION); // REMOVED
    // console.log('- S3_BUCKET_NAME value:', process.env.S3_BUCKET_NAME); // REMOVED
    // console.log('- REGION value:', process.env.REGION); // REMOVED
    
    // AWS credentials will be automatically available from environment variables
    // No need to check them explicitly as AWS SDK handles this
    
    console.log('AWS credentials found, processing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessArea = formData.get('businessArea') as string;
    const documentType = formData.get('documentType') as string;
    const recordId = formData.get('recordId') ? parseInt(formData.get('recordId') as string) : undefined;

    console.log('Form data received:', {
      fileName: file?.name,
      fileSize: file?.size,
      businessArea,
      documentType,
      recordId
    });

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!businessArea || !documentType) {
      console.error('Missing required fields:', { businessArea, documentType });
      return NextResponse.json(
        { error: 'Business area and document type are required' },
        { status: 400 }
      );
    }

    // Validate document type
    const validDocumentTypes: DocumentType[] = [
      'business-processes',
      'business-documents', 
      'quality-objectives',
      'performance-monitoring',
      'risk-management',
      'non-conformities',
      'record-keeping-systems',
      'business-improvements',
      'third-party-evaluations',
      'customer-feedback-systems',
      'training-sessions',
      'qms-assessments'
    ];

    if (!validDocumentTypes.includes(documentType as DocumentType)) {
      console.error('Invalid document type:', documentType);
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Validate file size using constants
    if (file.size > FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: `File size must be less than ${FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type using constants
    if (!FILE_UPLOAD_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.type as typeof FILE_UPLOAD_CONSTANTS.ALLOWED_FILE_TYPES[number])) {
      console.error('Unsupported file type:', file.type);
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      );
    }

    console.log('File validation passed, converting to buffer...');
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Buffer created, uploading via Lambda...');
    // Upload via Lambda function (ISO 27001 compliant)
    const result = await uploadFileViaLambda({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      businessArea,
      documentType: documentType as DocumentType,
      recordId
    });

    console.log('Lambda upload successful:', result);

    return NextResponse.json({
      success: true,
      data: {
        key: result.key,
        url: result.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 