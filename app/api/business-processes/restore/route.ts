import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Process ID is required' }, { status: 400 });
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