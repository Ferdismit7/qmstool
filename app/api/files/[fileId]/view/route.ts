import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, hasBusinessAreaAccess } from '@/lib/auth';
import { getSignedDownloadUrl } from '@/lib/services/s3Service';
import { prisma } from '@/lib/prisma';

// GET /api/files/[fileId]/view - View a file in browser with access control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Verify authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileId } = await params;
    
    // Decode the fileId in case it's URL encoded
    const decodedFileId = decodeURIComponent(fileId);
    
    // Find the file in the database by searching for the fileId in file_url
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

    // Check access
    const hasAccess = await hasBusinessAreaAccess(request, fileRecord.business_area as string);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Handle file URL - could be S3 URL or local path
    const fileUrl = fileRecord.file_url as string;
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      );
    }

    let viewUrl: string;

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
      viewUrl = await getSignedDownloadUrl(s3Key);
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

    // For viewing, we redirect to the signed URL
    // The browser will handle the file type appropriately
    return NextResponse.redirect(viewUrl);

  } catch (error) {
    console.error('Error viewing file:', error);
    return NextResponse.json(
      { error: 'Failed to view file' },
      { status: 500 }
    );
  }
}
