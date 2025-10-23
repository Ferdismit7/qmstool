import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

// GET - Fetch available business documents for linking to processes
export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessArea = searchParams.get('businessArea');
    const documentType = searchParams.get('documentType');
    const search = searchParams.get('search');
    const excludeProcessId = searchParams.get('excludeProcessId');
    const excludeDocumentId = searchParams.get('excludeDocumentId');

    // Build where clause
    const whereClause: Record<string, unknown> = {
      business_area: { in: userBusinessAreas },
      deleted_at: null
    };

    // Filter by business area if specified
    if (businessArea) {
      whereClause.business_area = businessArea;
    }

    // Filter by document type if specified
    if (documentType) {
      whereClause.document_type = documentType;
    }

    // Search by document name if specified
    if (search) {
      whereClause.document_name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Exclude documents already linked to a specific process
    if (excludeProcessId) {
      const processId = parseInt(excludeProcessId);
      if (!isNaN(processId)) {
        whereClause.linkedProcesses = {
          none: {
            business_process_id: processId
          }
        };
      }
    }

    // Exclude a specific document (avoid linking a document to itself)
    if (excludeDocumentId) {
      const docId = parseInt(excludeDocumentId);
      if (!isNaN(docId)) {
        whereClause.id = { not: docId };
      }
    }

    // Fetch available documents
    const documents = await prisma.businessDocumentRegister.findMany({
      where: whereClause,
      select: {
        id: true,
        document_name: true,
        document_type: true,
        version: true,
        doc_status: true,
        progress: true,
        status_percentage: true,
        business_area: true,
        sub_business_area: true,
        file_url: true,
        file_name: true,
        file_type: true,
        uploaded_at: true,
        update_date: true
      },
      orderBy: [
        { business_area: 'asc' },
        { document_type: 'asc' },
        { document_name: 'asc' }
      ]
    });

    // Group documents by type for better organization
    const groupedDocuments = documents.reduce((acc, doc) => {
      const type = doc.document_type || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(doc);
      return acc;
    }, {} as Record<string, typeof documents>);

    return NextResponse.json({ 
      success: true, 
      data: {
        documents,
        groupedDocuments,
        totalCount: documents.length
      }
    });
  } catch (error) {
    console.error('Error fetching available documents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
