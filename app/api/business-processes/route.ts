import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

// GET all business processes
export async function GET() {
  try {
    console.log('Fetching processes...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    const processes = await prisma.businessProcess.findMany();
    console.log('Found processes:', JSON.stringify(processes, null, 2));
    return NextResponse.json(processes);
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    return NextResponse.json({ 
      error: 'Failed to fetch processes',
      details: error?.message 
    }, { status: 500 });
  }
}

// POST (create) a new business process
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating process with data:', JSON.stringify(data, null, 2));
    
    // Ensure dates are properly formatted
    const processData = {
      ...data,
      id: crypto.randomUUID(),
      updateDate: new Date(),
      targetDate: new Date(data.targetDate),
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      statusPercentage: parseInt(data.statusPercentage, 10)
    };
    
    console.log('Processed data:', JSON.stringify(processData, null, 2));
    
    const process = await prisma.businessProcess.create({
      data: processData,
    });
    
    console.log('Created process:', JSON.stringify(process, null, 2));
    return NextResponse.json(process);
  } catch (error) {
    console.error('Error creating process:', error);
    return NextResponse.json({ 
      error: 'Failed to create process',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT (update) a business process
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await request.json();
    console.log('Updating process:', id, data);
    
    // Format dates properly
    const updateData = {
      ...data,
      targetDate: new Date(data.targetDate),
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      updateDate: new Date(),
      statusPercentage: parseInt(data.statusPercentage, 10)
    };
    
    const process = await prisma.businessProcess.update({
      where: { id },
      data: updateData,
    });
    
    console.log('Updated process:', process);
    return NextResponse.json(process);
  } catch (error) {
    console.error('Error updating process:', error);
    return NextResponse.json({ 
      error: 'Failed to update process',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE a business process
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log('Deleting process:', id);
    await prisma.businessProcess.delete({
      where: { id },
    });
    console.log('Process deleted successfully');
    return NextResponse.json({ message: 'Process deleted successfully' });
  } catch (error) {
    console.error('Error deleting process:', error);
    return NextResponse.json({ error: 'Failed to delete process' }, { status: 500 });
  }
} 