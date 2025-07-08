import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/services/s3Service';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessArea = formData.get('businessArea') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !businessArea || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const s3Key = await uploadFileToS3({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      businessArea,
      documentType,
    });

    return NextResponse.json({
      success: true,
      s3Key,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
} 