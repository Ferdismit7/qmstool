import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessArea } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const processId = searchParams.get('processId');
    if (!processId) {
      return NextResponse.json({ error: 'Process ID is required' }, { status: 400 });
    }
    // Only return versions for processes in the user's business area
    const versions = await prisma.businessProcessVersions.findMany({
      where: { businessProcessId: processId },
      orderBy: { versionNumber: 'desc' }
    });
    // You may want to join with the process table to check business area
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
} 