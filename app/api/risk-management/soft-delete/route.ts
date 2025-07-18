import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

interface SoftDeleteRequest {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
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
        { error: 'Invalid risk matrix ID' },
        { status: 400 }
      );
    }

    const existingRiskMatrix = await prisma.racmMatrix.findFirst({
      where: {
        id: id,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      }
    });

    if (!existingRiskMatrix) {
      return NextResponse.json(
        { error: 'Risk matrix record not found or access denied' },
        { status: 404 }
      );
    }

    const softDeletedRiskMatrix = await prisma.racmMatrix.update({
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
      message: 'Risk matrix record successfully deleted',
      deletedAt: softDeletedRiskMatrix.deleted_at,
      deletedBy: softDeletedRiskMatrix.deleted_by
    });

  } catch (error) {
    console.error('Error soft deleting risk matrix:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk matrix record' },
      { status: 500 }
    );
  }
} 