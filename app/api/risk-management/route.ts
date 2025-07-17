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
        }
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
      likelihood,
      impact,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk,
      status,
      doc_status
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
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk,
      status,
      doc_status,
      business_area: userBusinessArea
    });

    const result = await prisma.racmMatrix.create({
      data: {
        process_name,
        business_area: userBusinessArea,
        activity_description: activity_description || null,
        issue_description,
        issue_type: issue_type || null,
        likelihood: likelihood || null,
        impact: impact || null,
        control_description: control_description || null,
        control_type: control_type || null,
        control_owner: control_owner || null,
        control_effectiveness: control_effectiveness || null,
        residual_risk: residual_risk || null,
        status: status || null,
        doc_status: doc_status || null
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
      likelihood,
      impact,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk,
      status,
      doc_status
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
        }
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

    await prisma.racmMatrix.update({
      where: { id: Number(id) },
      data: {
        process_name,
        business_area: userBusinessArea,
        activity_description: activity_description || null,
        issue_description,
        issue_type: issue_type || null,
        likelihood: likelihood || null,
        impact: impact || null,
        control_description: control_description || null,
        control_type: control_type || null,
        control_owner: control_owner || null,
        control_effectiveness: control_effectiveness || null,
        residual_risk: residual_risk || null,
        status: status || null,
        doc_status: doc_status || null,
        updated_at: new Date()
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