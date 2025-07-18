import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

interface SoftDeleteRequest {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get current user ID from JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

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
        { error: 'Invalid process ID' },
        { status: 400 }
      );
    }

    // Check if the process exists and belongs to user's business areas
    const existingProcess = await prisma.businessProcessRegister.findFirst({
      where: {
        id: id,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only allow soft delete of non-deleted records
      }
    });

    if (!existingProcess) {
      return NextResponse.json(
        { error: 'Process not found or access denied' },
        { status: 404 }
      );
    }

    // Perform soft delete
    const softDeletedProcess = await prisma.businessProcessRegister.update({
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
      message: 'Process successfully deleted',
      deletedAt: softDeletedProcess.deleted_at,
      deletedBy: softDeletedProcess.deleted_by
    });

  } catch (error) {
    console.error('Error soft deleting business process:', error);
    return NextResponse.json(
      { error: 'Failed to delete business process' },
      { status: 500 }
    );
  }
} 