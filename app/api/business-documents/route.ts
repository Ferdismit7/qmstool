import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

// GET all business documents for user's business areas
export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    
    const documents = await query(`
      SELECT bdr.*, ba.business_area 
      FROM businessdocumentregister bdr
      LEFT JOIN businessareas ba ON bdr.business_area = ba.business_area
      WHERE bdr.business_area IN (${placeholders})
      ORDER BY bdr.update_date DESC
    `, userBusinessAreas);

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error in GET /api/business-documents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST new business document
export async function POST(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
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

    // Validate required fields
    if (!document_name) {
      return NextResponse.json(
        { error: 'Document name is required' },
        { status: 400 }
      );
    }

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

    const result = await query(`
      INSERT INTO businessdocumentregister (
        business_area, sub_business_area, document_name, name_and_numbering,
        document_type, version, progress, doc_status, status_percentage, priority,
        target_date, document_owner, update_date, remarks, review_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `, [
      userBusinessArea, sub_business_area, document_name, name_and_numbering,
      document_type, version || '1.0', progress || 'NOT_STARTED', doc_status || 'DRAFT',
      status_percentage, priority, target_date ? new Date(target_date) : null,
      document_owner, remarks, review_date ? new Date(review_date) : null
    ]);

    // Fetch the created record
    const [document] = await query(`
      SELECT bdr.*, ba.business_area 
      FROM businessdocumentregister bdr
      LEFT JOIN businessareas ba ON bdr.business_area = ba.business_area
      WHERE bdr.id = ?
    `, [result.insertId]);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/business-documents:', error);
    return NextResponse.json({ 
      error: 'Failed to create document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT (update) a business document
export async function PUT(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
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
    const queryParams = [...userBusinessAreas, Number(id)];

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
      review_date ? new Date(review_date) : null, ...queryParams
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch the updated record
    const [document] = await query(`
      SELECT bdr.*, ba.business_area 
      FROM businessdocumentregister bdr
      LEFT JOIN businessareas ba ON bdr.business_area = ba.business_area
      WHERE bdr.id = ? AND bdr.business_area IN (${placeholders})
    `, [Number(id), ...userBusinessAreas]);

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ 
      error: 'Failed to update document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE a business document
export async function DELETE(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, Number(id)];

    const result = await query(`
      DELETE FROM businessdocumentregister WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ 
      error: 'Failed to delete document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 