import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';
import { NextRequest } from 'next/server';

// GET all risk management controls for current user's business areas
export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    
    const result = await query(`
      SELECT 
        id,
        process_name,
        business_area,
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
        status,
        created_at,
        updated_at
      FROM racm_matrix 
      WHERE business_area IN (${placeholders})
      ORDER BY created_at DESC
    `, userBusinessAreas);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk management controls' },
      { status: 500 }
    );
  }
}

// POST new risk management control
export async function POST(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

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
      status,
      business_area: userBusinessArea
    });

    const result = await query(`
      INSERT INTO racm_matrix (
        process_name,
        business_area,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      process_name,
      userBusinessArea, // Force business area to user's area
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
export async function PUT(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      process_name,
      business_area,
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

    // Check if control exists and user has access
    const existingControl = await query(`
      SELECT business_area FROM racm_matrix WHERE id = ?
    `, [id]) as any[];

    if (!existingControl || existingControl.length === 0 || !userBusinessAreas.includes(existingControl[0].business_area)) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    // Use the first business area for updates
    const userBusinessArea = userBusinessAreas[0];

    // Ensure user can't change business area
    if (business_area && business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized to modify business area' }, { status: 403 });
    }

    await query(`
      UPDATE racm_matrix SET
        process_name = ?,
        business_area = ?,
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
      userBusinessArea, // Force business area to user's area
      activity_description || null,
      issue_description,
      issue_type || null,
      likelihood || null,
      impact || null,
      risk_score || null,
      control_description || null,
      control_type || null,
      control_owner || null,
      control_effectiveness || null,
      residual_risk || null,
      status || null,
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
export async function DELETE(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if control exists and user has access
    const existingControl = await query(`
      SELECT business_area FROM racm_matrix WHERE id = ?
    `, [id]) as any[];

    if (!existingControl || existingControl.length === 0 || !userBusinessAreas.includes(existingControl[0].business_area)) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
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