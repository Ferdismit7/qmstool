import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessArea } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Process ID is required' }, { status: 400 });
    }

    // Check if process exists and user has access
    const existingProcess = await prisma.businessProcessRegister.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProcess || existingProcess.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }

    const process = await prisma.businessProcessRegister.update({
      where: { id: parseInt(id) },
      data: {
        update_date: new Date().toISOString(),
        process_owner: 'system' // TODO: Replace with actual user when auth is implemented
      }
    });

    return NextResponse.json(process);
  } catch (error) {
    console.error('Error restoring process:', error);
    return NextResponse.json(
      { error: 'Failed to restore process' },
      { status: 500 }
    );
  }
} 