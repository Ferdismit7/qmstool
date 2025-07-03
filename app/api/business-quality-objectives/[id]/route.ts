import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserBusinessArea } from '@/lib/auth';

// GET a single business quality objective
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const objective = await prisma.businessQualityObjective.findUnique({
      where: { id: parseInt(params.id) }
    });
    if (!objective || objective.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Business quality objective not found' }, { status: 404 });
    }
    return NextResponse.json(objective);
  } catch (error) {
    console.error('Error fetching business quality objective:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business quality objective' },
      { status: 500 }
    );
  }
}

// PUT (update) a business quality objective
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if objective exists and user has access
    const existingObjective = await prisma.businessQualityObjective.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!existingObjective || existingObjective.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Business quality objective not found' }, { status: 404 });
    }

    const data = await request.json();
    const { id, business_area, target_date, ...updateData } = data;

    // Ensure user can't change business area
    if (business_area && business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized to modify business area' }, { status: 403 });
    }

    const objective = await prisma.businessQualityObjective.update({
      where: { id: parseInt(params.id) },
      data: {
        ...updateData,
        business_area: userBusinessArea, // Force business area to user's area
        businessareas: {
          connect: { business_area: userBusinessArea }
        },
        review_date: updateData.review_date ? new Date(updateData.review_date) : null
      }
    });
    return NextResponse.json(objective);
  } catch (error) {
    console.error('Error updating business quality objective:', error);
    return NextResponse.json(
      { error: 'Failed to update business quality objective' },
      { status: 500 }
    );
  }
}

// DELETE a business quality objective
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessArea = getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if objective exists and user has access
    const existingObjective = await prisma.businessQualityObjective.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!existingObjective || existingObjective.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Business quality objective not found' }, { status: 404 });
    }

    await prisma.businessQualityObjective.delete({
      where: { id: parseInt(params.id) }
    });
    return NextResponse.json(
      { message: 'Business quality objective deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting business quality objective:', error);
    return NextResponse.json(
      { error: 'Failed to delete business quality objective' },
      { status: 500 }
    );
  }
} 