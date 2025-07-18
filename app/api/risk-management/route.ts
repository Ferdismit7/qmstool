import { NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';
import { NextRequest } from 'next/server';

// GET all risk management controls for current user's business areas
export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.racmMatrix.findMany({
      where: {
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Filter out soft deleted records
      },
      orderBy: {
        created_at: 'desc'
      }
    });
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
      file_type,
      business_area: userBusinessArea
    });

    const result = await prisma.racmMatrix.create({
      data: {
        process_name,
        business_area: userBusinessArea,
        activity_description: activity_description || null,
        issue_description,
        issue_type: issue_type || null,
        inherent_risk_likeliness: inherent_risk_likeliness || null,
        inherent_risk_impact: inherent_risk_impact || null,
        inherent_risk_score: inherent_risk_score || null,
        control_description: control_description || null,
        control_type: control_type || null,
        control_owner: control_owner || null,
        control_effectiveness: control_effectiveness || null,
        residual_risk_likeliness: residual_risk_likeliness || null,
        status: status || null,
        doc_status: doc_status || null,
        control_progress: control_progress || null,
        control_target_date: control_target_date || null,
        residual_risk_impact: residual_risk_impact || null,
        residual_risk_overall_score: residual_risk_overall_score || null,
        file_url: file_url || null,
        file_name: file_name || null,
        file_size: file_size || null,
        file_type: file_type || null
      }
    });

    // Create history record for the new entry
    await prisma.racmMatrixHistory.create({
      data: {
        racm_matrix_id: result.id,
        inherent_risk_score: result.inherent_risk_score,
        residual_risk_overall_score: result.residual_risk_overall_score,
        change_type: 'created',
        change_date: new Date()
      }
    });

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
    } = body;

    // Validate required fields
    if (!id || !process_name || !issue_description) {
      return NextResponse.json(
        { error: 'ID, process name, and issue description are required' },
        { status: 400 }
      );
    }

    // Check if control exists and user has access
    const existingControl = await prisma.racmMatrix.findFirst({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      }
    });

    if (!existingControl) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    // Use the first business area for updates
    const userBusinessArea = userBusinessAreas[0];

    // Ensure user can't change business area
    if (business_area && business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized to modify business area' }, { status: 403 });
    }

    const updatedControl = await prisma.racmMatrix.update({
      where: { id: Number(id) },
      data: {
        process_name,
        business_area: userBusinessArea,
        activity_description: activity_description || null,
        issue_description,
        issue_type: issue_type || null,
        inherent_risk_likeliness: inherent_risk_likeliness || null,
        inherent_risk_impact: inherent_risk_impact || null,
        inherent_risk_score: inherent_risk_score || null,
        control_description: control_description || null,
        control_type: control_type || null,
        control_owner: control_owner || null,
        control_effectiveness: control_effectiveness || null,
        residual_risk_likeliness: residual_risk_likeliness || null,
        status: status || null,
        doc_status: doc_status || null,
        control_progress: control_progress || null,
        control_target_date: control_target_date || null,
        residual_risk_impact: residual_risk_impact || null,
        residual_risk_overall_score: residual_risk_overall_score || null,
        file_url: file_url || null,
        file_name: file_name || null,
        file_size: file_size || null,
        file_type: file_type || null,
        updated_at: new Date()
      }
    });

    // Create history record for the update
    await prisma.racmMatrixHistory.create({
      data: {
        racm_matrix_id: Number(id),
        inherent_risk_score: updatedControl.inherent_risk_score,
        residual_risk_overall_score: updatedControl.residual_risk_overall_score,
        change_type: 'updated',
        change_date: new Date()
      }
    });

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
    const existingControl = await prisma.racmMatrix.findFirst({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    if (!existingControl) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    await prisma.racmMatrix.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: 'Risk management control deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk management control' },
      { status: 500 }
    );
  }
} 