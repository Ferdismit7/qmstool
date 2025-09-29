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
        { error: 'Invalid monitoring ID' },
        { status: 400 }
      );
    }

    const existingMonitoring = await prisma.performanceMonitoringControl.findFirst({
      where: {
        id: id,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      }
    });

    if (!existingMonitoring) {
      return NextResponse.json(
        { error: 'Monitoring record not found or access denied' },
        { status: 404 }
      );
    }

    const softDeletedMonitoring = await prisma.performanceMonitoringControl.update({
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
      message: 'Monitoring record successfully deleted',
      deletedAt: softDeletedMonitoring.deleted_at,
      deletedBy: softDeletedMonitoring.deleted_by
    });

  } catch (error) {
    console.error('Error soft deleting performance monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to delete performance monitoring record' },
      { status: 500 }
    );
  }
} 