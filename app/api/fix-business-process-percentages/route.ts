import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // First, let's see what data we have
    const allProcesses = await query(`
      SELECT id, process_name, status_percentage
      FROM businessprocessregister
      ORDER BY id
    `);

    const invalidProcesses = allProcesses.filter((process: unknown) => {
      const percentage = Number((process as { status_percentage: number }).status_percentage);
      return isNaN(percentage) || percentage < 0 || percentage > 100;
    });

    // Fix invalid percentages
    let fixedCount = 0;
    for (const process of invalidProcesses) {
      const currentPercentage = Number(process.status_percentage);
      let newPercentage = 0;
      
      if (isNaN(currentPercentage)) {
        newPercentage = 0;
      } else if (currentPercentage < 0) {
        newPercentage = 0;
      } else if (currentPercentage > 100) {
        newPercentage = 100;
      }
      
      await query(`
        UPDATE businessprocessregister 
        SET status_percentage = ? 
        WHERE id = ?
      `, [newPercentage, process.id]);
      
      fixedCount++;
    }

    // Get updated data
    const updatedProcesses = await query(`
      SELECT id, process_name, status_percentage
      FROM businessprocessregister
      ORDER BY id
    `);

    // Calculate what the overall progress should be now
    const totalProcesses = updatedProcesses.length;
    const totalPercentage = updatedProcesses.reduce((sum: number, process: unknown) => {
      const percentage = (process as { status_percentage: number }).status_percentage || 0;
      return sum + Number(percentage);
    }, 0);
    
    const calculatedOverallProgress = totalProcesses > 0
      ? Math.round(totalPercentage / totalProcesses)
      : 0;

    return NextResponse.json({
      message: `Fixed ${fixedCount} processes with invalid percentages`,
      fixedCount,
      totalProcesses,
      calculatedOverallProgress,
      processes: updatedProcesses
    });
  } catch (error) {
    console.error('Error fixing business process percentages:', error);
    return NextResponse.json(
      { error: 'Failed to fix business process percentages' },
      { status: 500 }
    );
  }
} 