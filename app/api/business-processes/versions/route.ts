import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const processId = searchParams.get('processId');

    if (!processId) {
      return NextResponse.json({ error: 'Process ID is required' }, { status: 400 });
    }

    const versions = await prisma.businessProcessVersion.findMany({
      where: { businessProcessId: processId },
      orderBy: { versionNumber: 'desc' }
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
} 