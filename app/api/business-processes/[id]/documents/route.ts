import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

// GET - Fetch all documents linked to a business process
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const processId = parseInt(id);
    if (isNaN(processId)) {
      return NextResponse.json({ success: false, error: 'Invalid process ID' }, { status: 400 });
    }

    // Verify the business process exists and user has access
    const businessProcess = await prisma.businessProcessRegister.findFirst({
      where: {
        id: processId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!businessProcess) {
      return NextResponse.json({ success: false, error: 'Business process not found' }, { status: 404 });
    }

    // Fetch linked documents with full document details
    const linkedDocuments = await prisma.businessProcessDocumentLink.findMany({
      where: {
        business_process_id: processId
      },
      include: {
        businessDocument: {
          select: {
            id: true,
            document_name: true,
            document_type: true,
            version: true,
            doc_status: true,
            progress: true,
            status_percentage: true,
            file_url: true,
            file_name: true,
            file_type: true,
            uploaded_at: true
          }
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: linkedDocuments 
    });
  } catch (error) {
    console.error('Error fetching linked documents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Link documents to a business process
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const processId = parseInt(id);
    if (isNaN(processId)) {
      return NextResponse.json({ success: false, error: 'Invalid process ID' }, { status: 400 });
    }

    const body = await request.json();
    const { documentIds } = body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Document IDs array is required' }, { status: 400 });
    }

    // Verify the business process exists and user has access
    const businessProcess = await prisma.businessProcessRegister.findFirst({
      where: {
        id: processId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!businessProcess) {
      return NextResponse.json({ success: false, error: 'Business process not found' }, { status: 404 });
    }

    // Verify all documents exist and user has access
    const documents = await prisma.businessDocumentRegister.findMany({
      where: {
        id: { in: documentIds },
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (documents.length !== documentIds.length) {
      return NextResponse.json({ success: false, error: 'One or more documents not found or access denied' }, { status: 404 });
    }

    // Create the links (using createMany with skipDuplicates to handle existing links)
    const linksToCreate = documentIds.map(docId => ({
      business_process_id: processId,
      business_document_id: docId,
      created_by: user.userId
    }));

    const result = await prisma.businessProcessDocumentLink.createMany({
      data: linksToCreate,
      skipDuplicates: true
    });

    return NextResponse.json({ 
      success: true, 
      message: `${result.count} document(s) linked successfully`,
      linkedCount: result.count
    });
  } catch (error) {
    console.error('Error linking documents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unlink a document from a business process
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const processId = parseInt(id);
    if (isNaN(processId)) {
      return NextResponse.json({ success: false, error: 'Invalid process ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const docId = parseInt(documentId);
    if (isNaN(docId)) {
      return NextResponse.json({ success: false, error: 'Invalid document ID' }, { status: 400 });
    }

    // Verify the business process exists and user has access
    const businessProcess = await prisma.businessProcessRegister.findFirst({
      where: {
        id: processId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!businessProcess) {
      return NextResponse.json({ success: false, error: 'Business process not found' }, { status: 404 });
    }

    // Delete the link
    const result = await prisma.businessProcessDocumentLink.deleteMany({
      where: {
        business_process_id: processId,
        business_document_id: docId
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: 'Document link not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Document unlinked successfully' 
    });
  } catch (error) {
    console.error('Error unlinking document:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
