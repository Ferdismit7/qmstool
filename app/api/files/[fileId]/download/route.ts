import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl } from '@/lib/services/s3Service';
import { prisma } from '@/lib/prisma';
import { initializeSecrets } from '@/lib/awsSecretsManager';

// GET /api/files/[fileId]/download - Download a file with access control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Initialize secrets
    await initializeSecrets();
    
    // Check for authentication tokens (custom JWT or NextAuth)
    const authToken = request.cookies.get('authToken')?.value || 
                     request.cookies.get('clientAuthToken')?.value;
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value || 
                         request.cookies.get('__Secure-next-auth.session-token')?.value ||
                         request.cookies.get('authjs.session-token')?.value ||
                         request.cookies.get('__Secure-authjs.session-token')?.value;
    
    const allCookies = request.cookies.getAll();
    console.log('Session check:', { 
      hasAuthToken: !!authToken,
      hasNextAuthToken: !!nextAuthToken,
      totalCookies: allCookies.length,
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    });
    
    // Accept either custom JWT token or NextAuth session token
    if (!authToken && !nextAuthToken) {
      return NextResponse.json(
        { 
          error: 'Unauthorized - No authentication token found',
          debug: {
            totalCookies: allCookies.length,
            cookieNames: allCookies.map(c => c.name),
            hasAuthToken: !!authToken,
            hasNextAuthToken: !!nextAuthToken
          }
        },
        { status: 401 }
      );
    }

    const { fileId } = await params;
    
    // Decode the fileId in case it's URL encoded
    const decodedFileId = decodeURIComponent(fileId);
    
    // Find the file in the database by searching for the fileId in file_url
    // We need to search across all tables that have file_url fields
    const tables = [
      'businessProcessRegister',
      'businessDocumentRegister',
      'businessQualityObjective', 
      'performanceMonitoringControl',
      'nonConformity',
      'recordKeepingSystem',
      'businessImprovement',
      'thirdPartyEvaluation',
      'customerFeedbackSystem',
      'trainingSession',
      'qmsAssessment'
    ];

    let fileRecord: Record<string, unknown> | null = null;

    // Search for the file across all tables
    for (const table of tables) {
      try {
        const result = await ((prisma as unknown) as Record<string, { findFirst: (args: unknown) => Promise<unknown> }>)[table as string].findFirst({
          where: {
            file_url: {
              contains: decodedFileId
            }
          },
          select: {
            id: true,
            file_url: true,
            file_name: true,
            file_type: true,
            business_area: true
          }
        });

        if (result) {
          fileRecord = result as Record<string, unknown>;
          break;
        }
      } catch (error) {
        console.error(`Error searching in ${table}:`, error);
        continue;
      }
    }

    if (!fileRecord) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check access - for now, allow access if user is authenticated
    // TODO: Implement proper business area access control with NextAuth
    console.log('File access check - business_area:', fileRecord.business_area);

    // Handle file URL - could be S3 URL or local path
    const fileUrl = fileRecord.file_url as string;
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      );
    }

    let downloadUrl: string;

    if (fileUrl.includes('s3.amazonaws.com/')) {
      // Handle S3 URLs
      const urlParts = fileUrl.split('s3.amazonaws.com/');
      if (urlParts.length !== 2) {
        return NextResponse.json(
          { error: 'Invalid S3 URL format' },
          { status: 400 }
        );
      }
      const s3Key = urlParts[1];
      downloadUrl = await getSignedDownloadUrl(s3Key);
    } else if (fileUrl.startsWith('/uploads/')) {
      // Handle local file paths - serve directly from the file system
      // For now, we'll return an error since we don't have local file serving set up
      return NextResponse.json(
        { error: 'Local file serving not implemented. Please use S3 storage.' },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        { error: 'Unsupported file URL format' },
        { status: 400 }
      );
    }

    // Redirect to the signed URL for download
    return NextResponse.redirect(downloadUrl);

  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to download file',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
