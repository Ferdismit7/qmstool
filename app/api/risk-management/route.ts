import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET all risk management controls
export async function GET() {
  try {
    const controls = await query(`
      SELECT * FROM racm_matrix 
      ORDER BY id DESC
    `);
    return NextResponse.json(controls);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk management controls' },
      { status: 500 }
    );
  }
}

// POST new risk management control
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const {
      process_name,
      activity_description,
      issue_description,
      issue_type,
      likelihood,
      impact,
      risk_score,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk,
      status
    } = body;

    // Validate required fields
    if (!process_name || !issue_description) {
      console.error('Missing required fields:', { process_name, issue_description });
      return NextResponse.json(
        { error: 'Process name and issue description are required' },
        { status: 400 }
      );
    }

    // Log the values being inserted
    console.log('Values to insert:', {
      process_name,
      activity_description,
      issue_description,
      issue_type,
      likelihood,
      impact,
      risk_score,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk,
      status
    });

    const result = await query(`
      INSERT INTO racm_matrix (
        process_name,
        activity_description,
        issue_description,
        issue_type,
        likelihood,
        impact,
        control_description,
        control_type,
        control_owner,
        control_effectiveness,
        residual_risk,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      process_name,
      activity_description || null,
      issue_description,
      issue_type || null,
      likelihood || null,
      impact || null,
      control_description || null,
      control_type || null,
      control_owner || null,
      control_effectiveness || null,
      residual_risk || null,
      status || null
    ]);

    console.log('Insert result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database Error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create risk management control' },
      { status: 500 }
    );
  }
}

// PUT update risk management control
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      process_name,
      activity_description,
      issue_description,
      issue_type,
      likelihood,
      impact,
      risk_score,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk,
      status
    } = body;

    // Validate required fields
    if (!id || !process_name || !issue_description) {
      return NextResponse.json(
        { error: 'ID, process name, and issue description are required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE racm_matrix SET
        process_name = ?,
        activity_description = ?,
        issue_description = ?,
        issue_type = ?,
        likelihood = ?,
        impact = ?,
        risk_score = ?,
        control_description = ?,
        control_type = ?,
        control_owner = ?,
        control_effectiveness = ?,
        residual_risk = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      process_name,
      activity_description || null,
      issue_description,
      issue_type || null,
      likelihood || null,
      impact || null,
      risk_score || null,
      control_description || null,
      control_type || null,
      issue_type,
      likelihood,
      impact,
      risk_score,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk,
      status,
      id
    ]);

    return NextResponse.json({ message: 'Risk management control updated successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update risk management control' },
      { status: 500 }
    );
  }
}

// DELETE risk management control
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await query('DELETE FROM racm_matrix WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Risk management control deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk management control' },
      { status: 500 }
    );
  }
} 