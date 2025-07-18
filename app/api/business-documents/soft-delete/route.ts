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
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Check if the document exists and belongs to user's business areas
    const existingDocument = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: id,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only allow soft delete of non-deleted records
      }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Perform soft delete
    const softDeletedDocument = await prisma.businessDocumentRegister.update({
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
      message: 'Document successfully deleted',
      deletedAt: softDeletedDocument.deleted_at,
      deletedBy: softDeletedDocument.deleted_by
    });

  } catch (error) {
    console.error('Error soft deleting business document:', error);
    return NextResponse.json(
      { error: 'Failed to delete business document' },
      { status: 500 }
    );
  }
} 