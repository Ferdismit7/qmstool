import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

interface SoftDeleteRequest {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get current user ID from JWT token
    const user = await getUserFromToken(request);
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
        { error: 'Invalid third party evaluation ID' },
        { status: 400 }
      );
    }

    // Check if the third party evaluation exists and belongs to user's business areas
    const existingEvaluation = await prisma.thirdPartyEvaluation.findFirst({
      where: {
        id: id,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only allow soft delete of non-deleted records
      }
    });

    if (!existingEvaluation) {
      return NextResponse.json(
        { error: 'Third party evaluation not found or access denied' },
        { status: 404 }
      );
    }

    // Perform soft delete
    const softDeletedEvaluation = await prisma.thirdPartyEvaluation.update({
      where: {
        id: id
      },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Third party evaluation successfully deleted',
      deletedAt: softDeletedEvaluation.deleted_at,
      deletedBy: softDeletedEvaluation.deleted_by
    });

  } catch (error) {
    console.error('Error soft deleting third party evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to delete third party evaluation' },
      { status: 500 }
    );
  }
}
