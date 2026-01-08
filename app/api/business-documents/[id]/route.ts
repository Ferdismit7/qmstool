import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';
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

    const documentId = parseInt(id);

    // First, try to find the document with user's business area access
    let document = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: documentId,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Filter out soft-deleted documents
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
                uploaded_at: true,
                business_area: true, // Include business_area for access control
                deleted_at: true // Include deleted_at to filter later
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
        },
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

    // If document not found with direct access, check if it's linked to a document the user has access to
    if (!document) {
      // Check if this document is linked to any document the user has access to
      const linkedAccess = await prisma.businessDocumentLink.findFirst({
        where: {
          OR: [
            {
              primary_document_id: documentId,
              primaryDocument: {
                business_area: { in: userBusinessAreas },
                deleted_at: null
              }
            },
            {
              related_document_id: documentId,
              relatedDocument: {
                business_area: { in: userBusinessAreas },
                deleted_at: null
              }
            }
          ]
        }
      });

      // If linked, allow access even if from different business area
      if (linkedAccess) {
        document = await prisma.businessDocumentRegister.findFirst({
          where: {
            id: documentId,
            deleted_at: null // Only check if not deleted
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
                    uploaded_at: true,
                    business_area: true,
                    deleted_at: true
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
            },
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
      }
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found or you do not have access to it' }, { status: 404 });
    }

    // Filter out links to deleted documents
    // Allow viewing linked documents even if from different business areas (since they're linked)
    const validLinks = document.relatedDocumentsPrimary.filter(link => {
      // Check if related document exists and is not deleted
      if (!link.relatedDocument || link.relatedDocument.deleted_at) {
        return false;
      }
      // Allow all linked documents (they're linked, so user should be able to view them)
      return true;
    });

    // Transform the data to match the expected format (similar to business processes)
    const transformedDocument = {
      ...document,
      // Convert BigInt values to numbers for JSON serialization
      file_size: document.file_size ? Number(document.file_size) : null,
      fileVersions: document.fileVersions?.map(fv => ({
        id: fv.id,
        business_document_id: fv.business_document_id,
        document_version: fv.document_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      })) || [],
      linkedDocuments: validLinks.map(link => ({
        id: link.id,
        business_process_id: 0, // Not applicable for document-to-document links
        business_document_id: link.related_document_id,
        created_at: link.created_at,
        updated_at: link.updated_at,
        created_by: link.created_by,
        businessDocument: {
          ...link.relatedDocument,
          // Convert BigInt values in related documents too
          file_size: link.relatedDocument.file_size ? Number(link.relatedDocument.file_size) : null,
          // Remove deleted_at from response
          deleted_at: undefined
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

    // Get current document to check if file is being changed
    const currentDocument = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      }
    });

    if (!currentDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (file_url && file_url !== currentDocument.file_url && currentDocument.file_url && currentDocument.version) {
      await prisma.businessDocumentFileVersion.create({
        data: {
          business_document_id: parseInt(id),
          document_version: currentDocument.version,
          file_url: currentDocument.file_url,
          file_name: currentDocument.file_name || '',
          file_size: currentDocument.file_size,
          file_type: currentDocument.file_type,
          uploaded_by: userId
        }
      });
    }

    // Update the document using Prisma
    const updatedDocument = await prisma.businessDocumentRegister.updateMany({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      },
      data: {
        sub_business_area,
        document_name,
        name_and_numbering,
        document_type,
        version,
        progress,
        doc_status,
        status_percentage,
        priority,
        target_date: target_date ? new Date(target_date) : null,
        document_owner,
        update_date: new Date(),
        remarks,
        review_date: review_date ? new Date(review_date) : null,
        file_url,
        file_name,
        file_size: file_size ? BigInt(file_size) : null,
        file_type,
        uploaded_at: uploaded_at ? new Date(uploaded_at) : null
      }
    });

    if (updatedDocument.count === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch the updated record with relations
    const updatedRecord = await prisma.businessDocumentRegister.findFirst({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      },
      include: {
        businessareas: true,
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

    if (!updatedRecord) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Transform the response
    const transformedDocument = {
      ...updatedRecord,
      file_size: updatedRecord.file_size ? Number(updatedRecord.file_size) : null,
      fileVersions: updatedRecord.fileVersions.map(fv => ({
        id: fv.id,
        business_document_id: fv.business_document_id,
        document_version: fv.document_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };

    return NextResponse.json(transformedDocument);
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