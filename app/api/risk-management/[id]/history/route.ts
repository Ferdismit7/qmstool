import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessArea } from '@/lib/auth';

// GET risk management history for timeline chart
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the risk management control exists and user has access, and get creation date
    const [control] = await query(`
      SELECT id, created_at, inherent_risk_score FROM racm_matrix 
      WHERE id = ? AND business_area = ? AND deleted_at IS NULL
    `, [id, userBusinessArea]);
    
    if (!control) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    // Fetch history data (only inherent risk scores)
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

    // Return both the original creation data and history updates separately
    return NextResponse.json({
      creation: {
        inherent_risk_score: control.inherent_risk_score,
        created_at: control.created_at
      },
      history: historyData
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk management history' },
      { status: 500 }
    );
  }
} 