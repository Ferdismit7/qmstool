import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ManagementReportService } from '@/app/lib/services/managementReportService';

export async function GET() {
  try {
    // Get all business areas
    const businessAreas = await query('SELECT business_area FROM businessareas ORDER BY business_area');
    // For each business area, get stats
    const results = [];
    for (const ba of businessAreas) {
      const area = ba.business_area as string;
      // Get all status_percentage values from all relevant tables
      const processes = await query(
        'SELECT status_percentage, progress FROM businessprocessregister WHERE business_area = ?',
        [area]
      );
      const perfMon = await query(
        'SELECT status_percentage FROM performancemonitoringcontrol WHERE business_area = ?',
        [area]
      );
      const documents = await query(
        'SELECT status_percentage FROM businessdocumentregister WHERE business_area = ?',
        [area]
      );
      const objectives = await query(
        'SELECT status_percentage FROM businessqualityobjectives WHERE business_area = ?',
        [area]
      );
      // Collect only valid percentage values from all tables
      const allPercentages: number[] = [];
      for (const p of processes) {
        if (p.status_percentage !== null && p.status_percentage !== undefined && !isNaN(Number(p.status_percentage))) {
          const val = Math.min(Math.max(Number(p.status_percentage), 0), 100);
          allPercentages.push(val);
        }
      }
      for (const p of perfMon) {
        if (p.status_percentage !== null && p.status_percentage !== undefined && !isNaN(Number(p.status_percentage))) {
          const val = Math.min(Math.max(Number(p.status_percentage), 0), 100);
          allPercentages.push(val);
        }
      }
      for (const p of documents) {
        if (p.status_percentage !== null && p.status_percentage !== undefined && !isNaN(Number(p.status_percentage))) {
          const val = Math.min(Math.max(Number(p.status_percentage), 0), 100);
          allPercentages.push(val);
        }
      }
      for (const p of objectives) {
        if (p.status_percentage !== null && p.status_percentage !== undefined && !isNaN(Number(p.status_percentage))) {
          const val = Math.min(Math.max(Number(p.status_percentage), 0), 100);
          allPercentages.push(val);
        }
      }
      // Calculate overall progress
      const total = allPercentages.length;
      const avgProgress = total > 0 ? Math.round(allPercentages.reduce((sum, v) => sum + v, 0) / total) : 0;
      // Count minor/major challenges (from businessprocessregister only)
      const minorChallenges = processes.filter((p: unknown) => (p as { progress: string }).progress === 'Minor Challenges').length;
      const majorChallenges = processes.filter((p: unknown) => (p as { progress: string }).progress === 'Major Challenges').length;
      
      // Get management report health score for this business area
      let overallHealthScore = avgProgress; // fallback to avgProgress
      try {
        const managementReport = await ManagementReportService.generateManagementReport(area);
        overallHealthScore = managementReport.overallHealthScore;
      } catch (error) {
        console.warn(`Could not generate management report for ${area}:`, error);
        // Use avgProgress as fallback
      }
      
      results.push({
        businessArea: area,
        overallProgress: avgProgress,
        overallHealthScore: Math.round(overallHealthScore),
        minorChallenges,
        majorChallenges
      });
    }
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching operations summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch operations summary' }, { status: 500 });
  }
} 