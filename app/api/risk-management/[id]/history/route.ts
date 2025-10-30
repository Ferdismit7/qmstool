import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUserBusinessArea } from '@/lib/auth';

// Type definitions for timeline data
interface TimelineData {
  month_start: string;
  month_end: string;
  inherent_risk_score: number | null;
  last_change_date: string;
  last_change_type: string;
  month_key: string;
  month_label: string;
}

// GET risk management history for timeline chart
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First verify the risk management control exists and user has access
    const [control] = await query(`
      SELECT id, created_at, inherent_risk_score FROM racm_matrix 
      WHERE id = ? AND business_area = ? AND deleted_at IS NULL
    `, [id, userBusinessArea]) as Array<{
      id: number;
      created_at: string;
      inherent_risk_score: number | null;
    }>;
    
    if (!control) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    // Simple query to get all history records for this risk
    const timelineData = await query(`
      SELECT 
        DATE_FORMAT(change_date, '%Y-%m-01') as month_start,
        DATE_FORMAT(DATE_ADD(change_date, INTERVAL 1 MONTH) - INTERVAL 1 DAY, '%Y-%m-%d') as month_end,
        inherent_risk_score,
        change_date as last_change_date,
        change_type as last_change_type,
        DATE_FORMAT(change_date, '%Y-%m') as month_key,
        DATE_FORMAT(change_date, '%b %Y') as month_label
      FROM racm_matrix_history 
      WHERE racm_matrix_id = ?
      ORDER BY change_date ASC
    `, [id]) as TimelineData[];

    // Also get the original history data for reference
    const historyData = await query(`
      SELECT 
        id,
        racm_matrix_id,
        inherent_risk_score,
        change_date,
        change_type,
        created_at
      FROM racm_matrix_history 
      WHERE racm_matrix_id = ?
      ORDER BY change_date ASC
    `, [id]);

    // Return the timeline data
    return NextResponse.json({
      creation: {
        inherent_risk_score: control.inherent_risk_score,
        created_at: control.created_at
      },
      history: historyData,
      timeline: timelineData
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk management history' },
      { status: 500 }
    );
  }
}
