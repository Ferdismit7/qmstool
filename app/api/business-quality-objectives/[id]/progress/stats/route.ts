import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

// GET - Fetch progress statistics and chart data for a specific objective
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
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

    // Get current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

    // Fetch all progress entries for this objective
    const progressEntries = await prisma.businessQualityObjectiveProgress.findMany({
      where: { objective_id: objectiveId },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });

    // Calculate statistics
    const totalEntries = progressEntries.length;
    const averageProgress = totalEntries > 0 
      ? progressEntries.reduce((sum, entry) => sum + Number(entry.percentage), 0) / totalEntries 
      : 0;
    
    const maxProgress = totalEntries > 0 
      ? Math.max(...progressEntries.map(entry => Number(entry.percentage)))
      : 0;
    
    const minProgress = totalEntries > 0 
      ? Math.min(...progressEntries.map(entry => Number(entry.percentage)))
      : 0;

    // Get current year progress
    const currentYearEntries = progressEntries.filter(entry => entry.year === currentYear);
    const currentYearAverage = currentYearEntries.length > 0
      ? currentYearEntries.reduce((sum, entry) => sum + Number(entry.percentage), 0) / currentYearEntries.length
      : 0;

    // Get latest progress entry
    const latestEntry = progressEntries.length > 0 
      ? progressEntries[progressEntries.length - 1]
      : null;

    // Prepare chart data
    const chartData = progressEntries.map(entry => ({
      month: entry.month,
      year: entry.year,
      percentage: Number(entry.percentage),
      date: `${entry.year}-${entry.month.toString().padStart(2, '0')}`,
      monthName: new Date(entry.year, entry.month - 1).toLocaleString('default', { month: 'short' })
    }));

    // Group by year for yearly charts
    const yearlyData = progressEntries.reduce((acc, entry) => {
      if (!acc[entry.year]) {
        acc[entry.year] = [];
      }
      acc[entry.year].push({
        month: entry.month,
        percentage: Number(entry.percentage),
        monthName: new Date(entry.year, entry.month - 1).toLocaleString('default', { month: 'short' })
      });
      return acc;
    }, {} as Record<number, Array<{ month: number; percentage: number; monthName: string }>>);

    // Get months with missing data for current year
    const currentYearMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const existingMonths = currentYearEntries.map(entry => entry.month);
    const missingMonths = currentYearMonths.filter(month => !existingMonths.includes(month));

    // Calculate trend (comparing last 3 months vs previous 3 months)
    const lastThreeMonths = progressEntries.slice(-3);
    const previousThreeMonths = progressEntries.slice(-6, -3);
    
    let trend = 'stable';
    if (lastThreeMonths.length >= 2 && previousThreeMonths.length >= 2) {
      const lastThreeAvg = lastThreeMonths.reduce((sum, entry) => sum + Number(entry.percentage), 0) / lastThreeMonths.length;
      const previousThreeAvg = previousThreeMonths.reduce((sum, entry) => sum + Number(entry.percentage), 0) / previousThreeMonths.length;
      
      if (lastThreeAvg > previousThreeAvg + 5) {
        trend = 'improving';
      } else if (lastThreeAvg < previousThreeAvg - 5) {
        trend = 'declining';
      }
    }

    return NextResponse.json({
      success: true,
      objectiveId,
      statistics: {
        totalEntries,
        averageProgress: Math.round(averageProgress * 100) / 100,
        maxProgress,
        minProgress,
        currentYearAverage: Math.round(currentYearAverage * 100) / 100,
        latestProgress: latestEntry ? Number(latestEntry.percentage) : null,
        latestProgressDate: latestEntry ? `${latestEntry.year}-${latestEntry.month.toString().padStart(2, '0')}` : null,
        trend,
        missingMonths,
        currentYear,
        currentMonth
      },
      chartData,
      yearlyData,
      progressEntries: progressEntries.map(entry => ({
        id: entry.id,
        month: entry.month,
        year: entry.year,
        percentage: Number(entry.percentage),
        notes: entry.notes,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }))
    });

  } catch (error) {
    console.error('Error fetching progress statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress statistics' },
      { status: 500 }
    );
  }
}
