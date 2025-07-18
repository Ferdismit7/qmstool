import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessArea } from '@/lib/auth';

// GET single risk management control
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
    const [result] = await query(`
      SELECT * FROM racm_matrix WHERE id = ? AND business_area = ? AND deleted_at IS NULL
    `, [id, userBusinessArea]);
    
    if (!result) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk management control' },
      { status: 500 }
    );
  }
}

// PUT (update) a risk management control
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      process_name,
      activity_description,
      issue_description,
      issue_type,
      inherent_risk_likeliness,
      inherent_risk_impact,
      inherent_risk_score,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk_likeliness,
      status,
      doc_status,
      control_progress,
      control_target_date,
      residual_risk_impact,
      residual_risk_overall_score,
      file_url,
      file_name,
      file_size,
      file_type
    } = data;

    const result = await query(`
      UPDATE racm_matrix SET
        process_name = ?, activity_description = ?, issue_description = ?,
        issue_type = ?, inherent_risk_likeliness = ?, inherent_risk_impact = ?, 
        inherent_risk_score = ?, control_description = ?, control_type = ?, 
        control_owner = ?, control_effectiveness = ?, residual_risk_likeliness = ?, 
        status = ?, doc_status = ?, control_progress = ?, control_target_date = ?,
        residual_risk_impact = ?, residual_risk_overall_score = ?, file_url = ?,
        file_name = ?, file_size = ?, file_type = ?, updated_at = NOW()
      WHERE id = ? AND business_area = ? AND deleted_at IS NULL
    `, [
      process_name, activity_description, issue_description, issue_type,
      inherent_risk_likeliness, inherent_risk_impact, inherent_risk_score,
      control_description, control_type, control_owner, control_effectiveness,
      residual_risk_likeliness, status, doc_status, control_progress,
      control_target_date, residual_risk_impact, residual_risk_overall_score,
      file_url, file_name, file_size, file_type, id, userBusinessArea
    ]);

    if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    const [updatedControl] = await query(`
      SELECT * FROM racm_matrix WHERE id = ? AND business_area = ? AND deleted_at IS NULL
    `, [id, userBusinessArea]);

    return NextResponse.json(updatedControl);
  } catch (error) {
    console.error('Error updating risk management control:', error);
    return NextResponse.json(
      { error: 'Failed to update risk management control' },
      { status: 500 }
    );
  }
}

// DELETE a risk management control
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      DELETE FROM racm_matrix WHERE id = ? AND business_area = ?
    `, [id, userBusinessArea]);

    if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Risk management control deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting risk management control:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk management control' },
      { status: 500 }
    );
  }
} 