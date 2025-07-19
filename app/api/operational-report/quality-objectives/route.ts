import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

// Progress priority order (worst to best)
const PROGRESS_PRIORITY = {
  'Major Challenges': 1,
  'Minor Challenges': 2,
  'On-Track': 3,
  'Completed': 4
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessArea = searchParams.get('businessArea');

    if (!businessArea) {
      return NextResponse.json(
        { error: 'Business area parameter is required' },
        { status: 400 }
      );
    }

    // Get user's business areas for authorization
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this business area
    if (!userBusinessAreas.includes(businessArea)) {
      return NextResponse.json({ error: 'Unauthorized for this business area' }, { status: 403 });
    }

    // Fetch quality objectives for the specific business area (excluding deleted records)
    const qualityObjectives = await prisma.businessQualityObjective.findMany({
      where: {
        business_area: businessArea,
        deleted_at: null // Only include non-deleted records
      },
      select: {
        progress: true,
        status_percentage: true
      }
    });

    if (qualityObjectives.length === 0) {
      return NextResponse.json({
        status: 'Not Started',
        percentage: 0,
        count: 0
      });
    }

    // Calculate the worst progress status
    let worstProgress = 'Completed'; // Default to best
    let worstPriority = 4; // Default to best priority

    qualityObjectives.forEach(obj => {
      const priority = PROGRESS_PRIORITY[obj.progress as keyof typeof PROGRESS_PRIORITY] || 4;
      if (priority < worstPriority) {
        worstPriority = priority;
        worstProgress = obj.progress || 'Completed';
      }
    });

    // Calculate average percentage
    const totalPercentage = qualityObjectives.reduce((sum, obj) => sum + (obj.status_percentage || 0), 0);
    const averagePercentage = Math.round(totalPercentage / qualityObjectives.length);

    return NextResponse.json({
      status: worstProgress,
      percentage: averagePercentage,
      count: qualityObjectives.length
    });

  } catch (error) {
    console.error('Error fetching quality objectives for operational report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality objectives data' },
      { status: 500 }
    );
  }
} 