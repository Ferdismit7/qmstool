import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

// GET - Fetch all related documents for a business document
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
    const documentId = parseInt(id);
    if (isNaN(documentId)) {
      return NextResponse.json({ success: false, error: 'Invalid document ID' }, { status: 400 });
    }

    // Ensure user has access to the document's business area
    const baseDoc = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: documentId,
        business_area: { in: userBusinessAreas },
        deleted_at: null,
      },
      select: { id: true },
    });
    if (!baseDoc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Fetch linked documents with full document details
    const links = await prisma.businessDocumentLink.findMany({
      where: {
        primary_document_id: documentId
      },
      include: {
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

    // Manually fetch the related document data for each link
    // Filter out deleted documents only - allow viewing linked documents from different business areas
    const linkedDocuments = await Promise.all(
      links.map(async (link) => {
        const relatedDocument = await prisma.businessDocumentRegister.findFirst({
          where: { 
            id: link.related_document_id,
            deleted_at: null // Only include non-deleted documents (allow different business areas since they're linked)
          },
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
        });

        // Only return links where the related document exists and is not deleted
        if (!relatedDocument) {
          return null;
        }

        return {
          ...link,
          relatedDocument
        };
      })
    );

    // Filter out null entries (deleted or inaccessible documents)
    const validLinkedDocuments = linkedDocuments.filter(link => link !== null);

    return NextResponse.json({ 
      success: true, 
      data: validLinkedDocuments 
    });
  } catch (error) {
    console.error('Error fetching document links:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Link related documents to a business document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id);
    if (isNaN(documentId)) {
      return NextResponse.json({ success: false, error: 'Invalid document ID' }, { status: 400 });
    }

    const body = await request.json();
    const { relatedDocumentIds } = body;

    if (!Array.isArray(relatedDocumentIds) || relatedDocumentIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Document IDs array is required' }, { status: 400 });
    }

    // Verify the source document exists and user has access
    const sourceDocument = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: documentId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!sourceDocument) {
      return NextResponse.json({ success: false, error: 'Source document not found' }, { status: 404 });
    }

    // Verify all related documents exist and user has access
    const documents = await prisma.businessDocumentRegister.findMany({
      where: {
        id: { in: relatedDocumentIds },
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (documents.length !== relatedDocumentIds.length) {
      return NextResponse.json({ success: false, error: 'One or more related documents not found or access denied' }, { status: 404 });
    }

    // Create the links (using createMany with skipDuplicates to handle existing links)
    const linksToCreate = relatedDocumentIds
      .filter((docId) => docId !== documentId) // Don't link document to itself
      .map((docId) => ({
        primary_document_id: documentId,
        related_document_id: docId,
        created_by: user.userId
      }));

    if (linksToCreate.length === 0) {
      return NextResponse.json({ success: true, message: 'No links to create', linkedCount: 0 });
    }

    const result = await prisma.businessDocumentLink.createMany({
      data: linksToCreate,
      skipDuplicates: true
    });

    return NextResponse.json({ 
      success: true, 
      message: `${result.count} document(s) linked successfully`,
      linkedCount: result.count
    });
  } catch (error) {
    console.error('Error linking related documents:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove link between documents
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
    const documentId = parseInt(id);
    if (isNaN(documentId)) {
      return NextResponse.json({ success: false, error: 'Invalid document ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const relatedIdParam = searchParams.get('relatedId');

    if (!relatedIdParam) {
      return NextResponse.json({ success: false, error: 'Related document ID is required' }, { status: 400 });
    }

    const relatedId = parseInt(relatedIdParam);
    if (isNaN(relatedId)) {
      return NextResponse.json({ success: false, error: 'Invalid related document ID' }, { status: 400 });
    }

    // Verify the source document exists and user has access
    const sourceDocument = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: documentId,
        business_area: { in: userBusinessAreas },
        deleted_at: null
      }
    });

    if (!sourceDocument) {
      return NextResponse.json({ success: false, error: 'Source document not found' }, { status: 404 });
    }

    // Delete the link
    const result = await prisma.businessDocumentLink.deleteMany({
      where: {
        primary_document_id: documentId,
        related_document_id: relatedId
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
    console.error('Error removing document link:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


