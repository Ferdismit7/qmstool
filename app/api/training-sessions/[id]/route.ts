import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessArea, getUserFromToken } from '@/lib/auth';

// GET a single training session
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
    const session = await prisma.trainingSession.findUnique({
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
    if (!session || session.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }
    
    const transformedData = {
      ...session,
      file_size: session.file_size ? Number(session.file_size) : null,
      fileVersions: session.fileVersions.map(fv => ({
        id: fv.id,
        training_session_id: fv.training_session_id,
        session_version: fv.session_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching training session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training session' },
      { status: 500 }
    );
  }
}

// PUT (update) a training session
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

    // Check if session exists and user has access
    const existingSession = await prisma.trainingSession.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSession || existingSession.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }

    const data = await request.json();
    
    // Ensure user can't change business area
    if (data.business_area && data.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized to modify business area' }, { status: 403 });
    }

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (
      data.file_url &&
      data.file_url !== existingSession.file_url &&
      existingSession.file_url &&
      existingSession.version
    ) {
      await prisma.trainingSessionFileVersion.create({
        data: {
          training_session_id: parseInt(id),
          session_version: existingSession.version,
          file_url: existingSession.file_url,
          file_name: existingSession.file_name || '',
          file_size: existingSession.file_size,
          file_type: existingSession.file_type,
          uploaded_by: userId
        }
      });
    }

    const session = await prisma.trainingSession.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        business_area: userBusinessArea, // Force business area to user's area
        session_date: data.session_date ? new Date(data.session_date) : undefined
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
    
    const transformedData = {
      ...session,
      file_size: session.file_size ? Number(session.file_size) : null,
      fileVersions: session.fileVersions.map(fv => ({
        id: fv.id,
        training_session_id: fv.training_session_id,
        session_version: fv.session_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error updating training session:', error);
    return NextResponse.json(
      { error: 'Failed to update training session' },
      { status: 500 }
    );
  }
}

// DELETE a training session
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

    // Check if session exists and user has access
    const existingSession = await prisma.trainingSession.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSession || existingSession.business_area !== userBusinessArea) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }

    await prisma.trainingSession.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json(
      { message: 'Training session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting training session:', error);
    return NextResponse.json(
      { error: 'Failed to delete training session' },
      { status: 500 }
    );
  }
} 