import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

interface SoftDeleteRequest {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get current user ID from JWT token
    const user = getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = user.userId;
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const { id } = await request.json() as SoftDeleteRequest;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'Invalid training session ID' },
        { status: 400 }
      );
    }

    // Check if the training session exists and belongs to user's business areas
    const existingTrainingSession = await prisma.trainingSession.findFirst({
      where: {
        id: id,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only allow soft delete of non-deleted records
      }
    });

    if (!existingTrainingSession) {
      return NextResponse.json(
        { error: 'Training session not found or access denied' },
        { status: 404 }
      );
    }

    // Perform soft delete
    const softDeletedTrainingSession = await prisma.trainingSession.update({
      where: {
        id: id
      },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      },
      include: {
        businessareas: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Training session successfully deleted',
      deletedAt: softDeletedTrainingSession.deleted_at,
      deletedBy: softDeletedTrainingSession.deleted_by
    });

  } catch (error) {
    console.error('Error soft deleting training session:', error);
    return NextResponse.json(
      { error: 'Failed to delete training session' },
      { status: 500 }
    );
  }
}
