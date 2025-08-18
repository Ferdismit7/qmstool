import { NextRequest, NextResponse } from 'next/server';
import { ManagementReportService } from '@/app/lib/services/managementReportService';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

/**
 * API route handler for generating management reports
 * 
 * @route GET /api/management-report
 * @param {NextRequest} request - The incoming request
 * @returns {Promise<NextResponse>} JSON response containing management report data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessArea = searchParams.get('businessArea');

    // Get user's business areas for authorization
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If no specific business area requested, return report for user's primary area
    const targetBusinessArea = businessArea || userBusinessAreas[0];
    
    // Check if user has access to this business area
    if (!userBusinessAreas.includes(targetBusinessArea)) {
      return NextResponse.json({ error: 'Unauthorized for this business area' }, { status: 403 });
    }

    // Generate comprehensive management report
    const reportData = await ManagementReportService.generateManagementReport(targetBusinessArea);

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating management report:', error);
    return NextResponse.json(
      { error: 'Failed to generate management report' },
      { status: 500 }
    );
  }
}
