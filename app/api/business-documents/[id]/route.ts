import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

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

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [parseInt(id), ...userBusinessAreas];

    const [document] = await query(`
      SELECT bdr.*, ba.business_area 
      FROM businessdocumentregister bdr
      LEFT JOIN businessareas ba ON bdr.business_area = ba.business_area
      WHERE bdr.id = ? AND bdr.business_area IN (${placeholders})
    `, queryParams);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json(document);
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
    } = data;

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [parseInt(id), ...userBusinessAreas];

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
        remarks = ?, review_date = ?
      WHERE id = ? AND business_area IN (${placeholders})
    `, [
      sub_business_area, document_name, name_and_numbering, document_type,
      version, progress, doc_status, status_percentage, priority,
      target_date ? new Date(target_date) : null, document_owner, remarks,
      review_date ? new Date(review_date) : null, parseInt(id), ...userBusinessAreas
    ]);

    if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch the updated record
    const [updatedDocument] = await query(`
      SELECT bdr.*, ba.business_area 
      FROM businessdocumentregister bdr
      LEFT JOIN businessareas ba ON bdr.business_area = ba.business_area
      WHERE bdr.id = ? AND bdr.business_area IN (${placeholders})
    `, [parseInt(id), ...userBusinessAreas]);

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
    const queryParams = [parseInt(id), ...userBusinessAreas];

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
      WHERE id = ? AND business_area IN (${placeholders})
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