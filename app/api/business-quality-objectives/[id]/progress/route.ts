import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

interface UpdateProgressRequest {
  month: number;
  year: number;
  percentage: number;
  notes?: string;
}

// GET - Fetch all progress entries for a specific objective
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const objectiveId = parseInt(id);
    if (isNaN(objectiveId)) {
      return NextResponse.json(
        { error: 'Invalid objective ID' },
        { status: 400 }
      );
    }

    // Check if objective exists and user has access
    const objective = await prisma.businessQualityObjective.findFirst({
      where: {
        id: objectiveId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!objective) {
      return NextResponse.json(
        { error: 'Objective not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch all progress entries for this objective
    const progressEntries = await prisma.businessQualityObjectiveProgress.findMany({
      where: { objective_id: objectiveId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      objectiveId,
      progressEntries
    });

  } catch (error) {
    console.error('Error fetching progress entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress entries' },
      { status: 500 }
    );
  }
}

// POST - Create or update a progress entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = user.userId;
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const objectiveId = parseInt(id);
    if (isNaN(objectiveId)) {
      return NextResponse.json(
        { error: 'Invalid objective ID' },
        { status: 400 }
      );
    }

    const { month, year, percentage, notes }: UpdateProgressRequest = await request.json();

    // Validation
    if (!month || !year || percentage === undefined) {
      return NextResponse.json(
        { error: 'Month, year, and percentage are required' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if objective exists and user has access
    const objective = await prisma.businessQualityObjective.findFirst({
      where: {
        id: objectiveId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!objective) {
      return NextResponse.json(
        { error: 'Objective not found or access denied' },
        { status: 404 }
      );
    }

    // Create or update progress entry
    const progressEntry = await prisma.businessQualityObjectiveProgress.upsert({
      where: {
        objective_id_month_year: {
          objective_id: objectiveId,
          month,
          year
        }
      },
      update: {
        percentage,
        notes: notes || null,
        updated_at: new Date()
      },
      create: {
        objective_id: objectiveId,
        month,
        year,
        percentage,
        notes: notes || null,
        created_by: userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Progress entry saved successfully',
      progressEntry
    });

  } catch (error) {
    console.error('Error saving progress entry:', error);
    return NextResponse.json(
      { error: 'Failed to save progress entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific progress entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const objectiveId = parseInt(id);
    if (isNaN(objectiveId)) {
      return NextResponse.json(
        { error: 'Invalid objective ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year parameters are required' },
        { status: 400 }
      );
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      );
    }

    // Check if objective exists and user has access
    const objective = await prisma.businessQualityObjective.findFirst({
      where: {
        id: objectiveId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!objective) {
      return NextResponse.json(
        { error: 'Objective not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the progress entry
    const deletedEntry = await prisma.businessQualityObjectiveProgress.delete({
      where: {
        objective_id_month_year: {
          objective_id: objectiveId,
          month: monthNum,
          year: yearNum
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Progress entry deleted successfully',
      deletedEntry
    });

  } catch (error) {
    console.error('Error deleting progress entry:', error);
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Progress entry not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete progress entry' },
      { status: 500 }
    );
  }
}
