import { NextResponse } from 'next/server';
import { 
  getBusinessProcessById, 
  updateBusinessProcess, 
  deleteBusinessProcess 
} from '@/lib/businessProcessRegister';
import type { BusinessProcessRegisterInput } from '@/lib/types/businessProcessRegister';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const process = await getBusinessProcessById(Number(params.id));
    if (!process) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }
    return NextResponse.json(process);
  } catch (error) {
    console.error('Failed to fetch process:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data: Partial<BusinessProcessRegisterInput> = await request.json();
    const success = await updateBusinessProcess(Number(params.id), data);
    if (!success) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update process:', error);
    return NextResponse.json(
      { error: 'Failed to update process' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteBusinessProcess(Number(params.id));
    if (!success) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete process:', error);
    return NextResponse.json(
      { error: 'Failed to delete process' }, 
      { status: 500 }
    );
  }
} 