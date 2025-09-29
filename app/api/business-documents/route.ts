import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

// Helper function to get local time in UTC+2 timezone
const getLocalTime = () => {
  const now = new Date();
  // Add 2 hours to UTC to get your local time
  const localTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return localTime;
};

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

    const documents = await prisma.businessDocumentRegister.findMany({
      where: {
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Filter out soft deleted records
      },
      include: {
        businessareas: true
      },
      orderBy: {
        update_date: 'desc'
      }
    });

    // Convert BigInt to Number for JSON serialization
    const serializedDocuments = documents.map(doc => ({
      ...doc,
      file_size: (doc as { file_size?: bigint | null }).file_size ? Number((doc as { file_size?: bigint | null }).file_size) : null
    }));

    return NextResponse.json(serializedDocuments);
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
    console.log('Received data in POST API:', data); // Debug log
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

    const createData = {
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
      review_date: review_date ? new Date(review_date) : null,
      file_url: file_url,
      file_name: file_name,
      file_size: file_size ? BigInt(file_size) : null,
      file_type: file_type,
      uploaded_at: file_url ? getLocalTime() : null, // Set timestamp in local timezone
    };
    
    console.log('Creating document with data:', createData); // Debug log
    
    const document = await prisma.businessDocumentRegister.create({
      data: createData,
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
    console.log('Received data in PUT API:', data); // Debug log
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
    } = data;

    const updateData = {
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
      review_date: review_date ? new Date(review_date) : null,
      file_url: file_url,
      file_name: file_name,
      file_size: file_size ? BigInt(file_size) : null,
      file_type: file_type,
      uploaded_at: file_url ? getLocalTime() : null, // Set timestamp in local timezone
    };
    
    console.log('Updating document with data:', updateData); // Debug log
    
    const result = await prisma.businessDocumentRegister.updateMany({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only update non-deleted records
      },
      data: updateData
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

    // Convert BigInt to Number for JSON serialization
    const serializedDocument = {
      ...document,
      file_size: document && (document as { file_size?: bigint | null }).file_size ? Number((document as { file_size?: bigint | null }).file_size) : null
    };

    return NextResponse.json(serializedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ 
      error: 'Failed to update document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE a business document (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    // Get current user ID from JWT token
    const user = await getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = user.userId;
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

    const documentId = Number(id);
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // Check if the document exists and belongs to user's business areas
    const existingDocument = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: documentId,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only allow soft delete of non-deleted records
      }
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Perform soft delete with audit trail
    const softDeletedDocument = await prisma.businessDocumentRegister.update({
      where: { id: documentId },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      },
      include: {
        businessareas: true
      }
    });
    
    return NextResponse.json({ 
      message: 'Document deleted successfully',
      deletedAt: softDeletedDocument.deleted_at,
      deletedBy: softDeletedDocument.deleted_by
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ 
      error: 'Failed to delete document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}