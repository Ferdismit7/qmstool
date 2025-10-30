import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessArea } from '@/lib/auth';
import { handleFileUploadFromJson, prepareFileDataForPrisma } from '@/lib/fileUpload';

// GET a single business quality objective
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const objective = await prisma.businessQualityObjective.findUnique({
      where: { id: parseInt(id) }
    });
    if (!objective || objective.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Business quality objective not found' }, { status: 404 });
    }
    
    // Transform BigInt fields to strings for JSON serialization
    const transformedObjective = {
      ...objective,
      file_size: objective.file_size ? objective.file_size.toString() : null
    };
    
    return NextResponse.json(transformedObjective);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if objective exists and user has access
    const existingObjective = await prisma.businessQualityObjective.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingObjective || existingObjective.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Business quality objective not found' }, { status: 404 });
    }

    const data = await request.json();
    const { business_area, ...updateData } = data;

    // Ensure user can't change business area
    if (data.business_area && data.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized to modify business area' }, { status: 403 });
    }

    // Handle file upload data
    const fileUploadResult = await handleFileUploadFromJson(request);
    if (!fileUploadResult.success && fileUploadResult.error) {
      return NextResponse.json({ error: fileUploadResult.error }, { status: 400 });
    }

    const fileData = fileUploadResult.data ? prepareFileDataForPrisma(fileUploadResult.data) : {};

    const objective = await prisma.businessQualityObjective.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        ...fileData,
        review_date: updateData.review_date ? new Date(updateData.review_date) : null
      }
    });
    
    // Transform BigInt fields to strings for JSON serialization
    const transformedObjective = {
      ...objective,
      file_size: objective.file_size ? objective.file_size.toString() : null
    };
    
    return NextResponse.json(transformedObjective);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if objective exists and user has access
    const existingObjective = await prisma.businessQualityObjective.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingObjective || existingObjective.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Business quality objective not found' }, { status: 404 });
    }

    await prisma.businessQualityObjective.delete({
      where: { id: parseInt(id) }
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