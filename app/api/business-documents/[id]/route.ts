import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET a single business document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if id is "new" or not a valid number
    if (id === 'new' || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    
    // Get user's business areas
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    // Use Prisma to fetch document with linked documents (same approach as business processes)
    const document = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        }
      },
      include: {
        businessareas: true,
        relatedDocumentsPrimary: {
          include: {
            relatedDocument: {
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
                file_size: true,
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
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Transform the data to match the expected format (similar to business processes)
    const transformedDocument = {
      ...document,
      // Convert BigInt values to numbers for JSON serialization
      file_size: document.file_size ? Number(document.file_size) : null,
      linkedDocuments: document.relatedDocumentsPrimary.map(link => ({
        id: link.id,
        business_process_id: 0, // Not applicable for document-to-document links
        business_document_id: link.related_document_id,
        created_at: link.created_at,
        updated_at: link.updated_at,
        created_by: link.created_by,
        businessDocument: {
          ...link.relatedDocument,
          // Convert BigInt values in related documents too
          file_size: link.relatedDocument.file_size ? Number(link.relatedDocument.file_size) : null
        },
        createdBy: link.createdBy
      }))
    };

    return NextResponse.json(transformedDocument);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT (update) a business document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      sub_business_area,
      document_name,
      name_and_numbering,
      document_type,
      version,
      progress,
      doc_status,
      status_percentage,
      priority,
      target_date,
      document_owner,
      remarks,
      review_date,
      file_url,
      file_name,
      file_size,
      file_type,
      uploaded_at,
    } = data;

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, parseInt(id)];

    // Check if document exists and user has access
    const [existingDocument] = await query(`
      SELECT business_area FROM businessdocumentregister 
      WHERE business_area IN (${placeholders}) AND id = ?
    `, queryParams);

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const result = await query(`
      UPDATE businessdocumentregister SET
        sub_business_area = ?, document_name = ?, name_and_numbering = ?,
        document_type = ?, version = ?, progress = ?, doc_status = ?, status_percentage = ?,
        priority = ?, target_date = ?, document_owner = ?, update_date = NOW(),
        remarks = ?, review_date = ?, file_url = ?, file_name = ?, file_size = ?, 
        file_type = ?, uploaded_at = ?
      WHERE business_area IN (${placeholders}) AND id = ?
    `, [
      sub_business_area, document_name, name_and_numbering, document_type,
      version, progress, doc_status, status_percentage, priority,
      target_date ? new Date(target_date) : null, document_owner, remarks,
      review_date ? new Date(review_date) : null, file_url, file_name, file_size,
      file_type, uploaded_at ? new Date(uploaded_at) : null, ...userBusinessAreas, parseInt(id)
    ]);

    if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch the updated record
    const [updatedDocument] = await query(`
      SELECT bdr.*, ba.business_area 
      FROM businessdocumentregister bdr
      LEFT JOIN businessareas ba ON bdr.business_area = ba.business_area
      WHERE bdr.business_area IN (${placeholders}) AND bdr.id = ?
    `, [...userBusinessAreas, parseInt(id)]);

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE a business document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, parseInt(id)];

    // Check if document exists and user has access
    const [existingDocument] = await query(`
      SELECT business_area FROM businessdocumentregister 
      WHERE business_area IN (${placeholders}) AND id = ?
    `, queryParams);

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const result = await query(`
      DELETE FROM businessdocumentregister 
      WHERE business_area IN (${placeholders}) AND id = ?
    `, queryParams);

    if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 