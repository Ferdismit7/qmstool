import { NextResponse } from 'next/server';
import { 
  getAllBusinessProcesses, 
  createBusinessProcess, 
  searchBusinessProcesses,
  updateBusinessProcess,
  getBusinessProcessById
} from '@/lib/businessProcessRegister';
import type { BusinessProcessRegisterInput } from '@/lib/types/businessProcessRegister';

// GET all business processes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    if (searchTerm) {
      const processes = await searchBusinessProcesses(searchTerm);
      return NextResponse.json(processes);
    }

    const processes = await getAllBusinessProcesses();
    return NextResponse.json(processes);
  } catch (error) {
    console.error('Failed to fetch processes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processes' }, 
      { status: 500 }
    );
  }
}

// POST (create) a new business process
export async function POST(request: Request) {
  try {
    const data: BusinessProcessRegisterInput = await request.json();
    const newId = await createBusinessProcess(data);
    // Fetch the full process after creation
    const newProcess = await getBusinessProcessById(newId);
    return NextResponse.json(newProcess, { status: 201 });
  } catch (error) {
    console.error('Failed to create process:', error);
    return NextResponse.json(
      { error: 'Failed to create process' }, 
      { status: 500 }
    );
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
    await updateBusinessProcess(parseInt(id), data);
    // Fetch the full process after update
    const updatedProcess = await getBusinessProcessById(parseInt(id));
    return NextResponse.json(updatedProcess);
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
    console.log('Deleting process (mock):', id);
    // Return a mock success response
    return NextResponse.json({ message: `Process ${id} deleted (mock)` });
  } catch (error) {
    console.error('Error deleting process (mock):', error);
    return NextResponse.json({ error: 'Failed to delete process (mock)' }, { status: 500 });
  }
} 