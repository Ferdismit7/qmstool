import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessArea } from '@/lib/auth';

// GET a single training session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = await prisma.trainingSession.findUnique({
      where: { id: parseInt(id) }
    });
    if (!session || session.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching training session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training session' },
      { status: 500 }
    );
  }
}

// PUT (update) a training session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if session exists and user has access
    const existingSession = await prisma.trainingSession.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSession || existingSession.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }

    const data = await request.json();
    
    // Ensure user can't change business area
    if (data.business_area && data.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized to modify business area' }, { status: 403 });
    }

    const session = await prisma.trainingSession.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        business_area: userBusinessArea, // Force business area to user's area
        session_date: data.session_date ? new Date(data.session_date) : undefined
      }
    });
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating training session:', error);
    return NextResponse.json(
      { error: 'Failed to update training session' },
      { status: 500 }
    );
  }
}

// DELETE a training session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if session exists and user has access
    const existingSession = await prisma.trainingSession.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSession || existingSession.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }

    await prisma.trainingSession.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json(
      { message: 'Training session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting training session:', error);
    return NextResponse.json(
      { error: 'Failed to delete training session' },
      { status: 500 }
    );
  }
} 