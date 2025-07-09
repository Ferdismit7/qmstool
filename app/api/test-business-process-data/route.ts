import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const businessProcesses = await query(`
      SELECT id, process_name, status_percentage, progress, doc_status
      FROM businessprocessregister
      ORDER BY id
    `);

    // Calculate what the frontend would calculate
    const totalProcesses = businessProcesses.length;
    const totalPercentage = businessProcesses.reduce((sum: number, process: unknown) => {
      const percentage = (process as { status_percentage: number }).status_percentage || 0;
      return sum + Number(percentage);
    }, 0);
    
    const calculatedOverallProgress = totalProcesses > 0
      ? Math.round(totalPercentage / totalProcesses)
      : 0;

    return NextResponse.json({
      processes: businessProcesses,
      calculation: {
        totalProcesses,
        totalPercentage,
        calculatedOverallProgress,
        average: totalProcesses > 0 ? totalPercentage / totalProcesses : 0
      }
    });
  } catch (error) {
    console.error('Error fetching business process data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business process data' },
      { status: 500 }
    );
  }
}