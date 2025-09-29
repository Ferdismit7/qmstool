import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

interface SoftDeleteRequest {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
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
        { error: 'Invalid objective ID' },
        { status: 400 }
      );
    }

    const existingObjective = await prisma.businessQualityObjective.findFirst({
      where: {
        id: id,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      }
    });

    if (!existingObjective) {
      return NextResponse.json(
        { error: 'Objective not found or access denied' },
        { status: 404 }
      );
    }

    const softDeletedObjective = await prisma.businessQualityObjective.update({
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
      message: 'Objective successfully deleted',
      deletedAt: softDeletedObjective.deleted_at,
      deletedBy: softDeletedObjective.deleted_by
    });

  } catch (error) {
    console.error('Error soft deleting business quality objective:', error);
    return NextResponse.json(
      { error: 'Failed to delete business quality objective' },
      { status: 500 }
    );
  }
} 