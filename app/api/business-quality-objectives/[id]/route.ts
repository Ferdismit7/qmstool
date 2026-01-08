import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessArea, getUserFromToken } from '@/lib/auth';
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
      where: { id: parseInt(id) },
      include: {
        fileVersions: {
          orderBy: {
            uploaded_at: 'desc'
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
    if (!objective || objective.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Business quality objective not found' }, { status: 404 });
    }
    
    // Transform BigInt fields to strings for JSON serialization
    const transformedObjective = {
      ...objective,
      file_size: objective.file_size ? objective.file_size.toString() : null,
      fileVersions: objective.fileVersions.map(fv => ({
        id: fv.id,
        business_quality_objective_id: fv.business_quality_objective_id,
        objective_version: fv.objective_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? fv.file_size.toString() : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
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
    const { review_date } = data as { review_date?: string | number | Date };
    const updateData = { ...data } as Record<string, unknown>;
    delete updateData.business_area;

    // Ensure user can't change business area
    if (data.business_area && data.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized to modify business area' }, { status: 403 });
    }

    // Handle file upload data - pass the already-parsed body instead of request
    const fileUploadResult = await handleFileUploadFromJson(data);
    if (!fileUploadResult.success && fileUploadResult.error) {
      return NextResponse.json({ error: fileUploadResult.error }, { status: 400 });
    }

    const fileData = fileUploadResult.data ? prepareFileDataForPrisma(fileUploadResult.data) : {};

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (
      fileData.file_url &&
      fileData.file_url !== existingObjective.file_url &&
      existingObjective.file_url &&
      existingObjective.version
    ) {
      await prisma.businessQualityObjectiveFileVersion.create({
        data: {
          business_quality_objective_id: parseInt(id),
          objective_version: existingObjective.version,
          file_url: existingObjective.file_url,
          file_name: existingObjective.file_name || '',
          file_size: existingObjective.file_size,
          file_type: existingObjective.file_type,
          uploaded_by: userId
        }
      });
    }

    const parsedReviewDate = review_date ? new Date(review_date) : null;

    const objective = await prisma.businessQualityObjective.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        ...fileData,
        review_date: parsedReviewDate
      },
      include: {
        fileVersions: {
          orderBy: {
            uploaded_at: 'desc'
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    // Transform BigInt fields to strings for JSON serialization
    const transformedObjective = {
      ...objective,
      file_size: objective.file_size ? objective.file_size.toString() : null,
      fileVersions: objective.fileVersions.map(fv => ({
        id: fv.id,
        business_quality_objective_id: fv.business_quality_objective_id,
        objective_version: fv.objective_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? fv.file_size.toString() : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
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