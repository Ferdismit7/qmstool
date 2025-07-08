import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

// GET all business documents for user's business areas
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const documents = await prisma.businessDocumentRegister.findMany({
      where: {
        business_area: {
          in: userBusinessAreas
        }
      },
      include: {
        businessareas: true
      },
      orderBy: {
        update_date: 'desc'
      }
    });

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
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

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

    const document = await prisma.businessDocumentRegister.create({
      data: {
        business_area: userBusinessArea,
        sub_business_area: sub_business_area,
        document_name: document_name,
        name_and_numbering: name_and_numbering,
        document_type: document_type,
        version: version || '1.0',
        progress: progress || 'NOT_STARTED',
        doc_status: doc_status || 'DRAFT',
        status_percentage: status_percentage,
        priority: priority,
        target_date: target_date ? new Date(target_date) : null,
        document_owner: document_owner,
        update_date: new Date(),
        remarks: remarks,
        review_date: review_date ? new Date(review_date) : null
      },
      include: {
        businessareas: true
      }
    });

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
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

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

    const result = await prisma.businessDocumentRegister.updateMany({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
      },
      data: {
        sub_business_area: sub_business_area,
        document_name: document_name,
        name_and_numbering: name_and_numbering,
        document_type: document_type,
        version: version,
        progress: progress,
        doc_status: doc_status,
        status_percentage: status_percentage,
        priority: priority,
        target_date: target_date ? new Date(target_date) : null,
        document_owner: document_owner,
        update_date: new Date(),
        remarks: remarks,
        review_date: review_date ? new Date(review_date) : null
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch the updated record
    const document = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
      },
      include: {
        businessareas: true
      }
    });

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
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

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

    const result = await prisma.businessDocumentRegister.deleteMany({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    if (result.count === 0) {
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