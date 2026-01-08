import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

// Helper function to transform database fields to component expected format
const transformBusinessProcess = (dbProcess: unknown) => {
  const p = dbProcess as {
    id: number;
    business_area: string;
    sub_business_area: string | null;
    process_name: string;
    document_name: string | null;
    version: string | null;
    progress: string | null;
    doc_status: string | null;
    status_percentage: number | null;
    priority: string | null;
    target_date: Date | null;
    process_owner: string | null;
    update_date: Date | null;
    remarks: string | null;
    review_date: Date | null;
    file_url: string | null;
    file_name: string | null;
    file_size: bigint | null;
    file_type: string | null;
    uploaded_at: Date | null;
    linkedDocuments?: Array<{
      id: number;
      business_process_id: number;
      business_document_id: number;
      created_at: Date;
      updated_at: Date;
      created_by: number | null;
      businessDocument: {
        id: number;
        document_name: string;
        document_type: string;
        version: string;
        doc_status: string;
        progress: string;
        status_percentage: number;
        file_url: string;
        file_name: string;
        file_type: string;
        uploaded_at: Date;
      };
      createdBy: {
        id: number;
        username: string;
        email: string;
      } | null;
    }>;
    fileVersions?: Array<{
      id: number;
      business_process_id: number;
      process_version: string;
      file_url: string;
      file_name: string;
      file_size: bigint | null;
      file_type: string | null;
      uploaded_at: Date;
      uploaded_by: number | null;
      uploadedBy: {
        id: number;
        username: string;
        email: string;
      } | null;
    }>;
  };
  return {
    id: p.id,
    businessArea: p.business_area,
    subBusinessArea: p.sub_business_area,
    processName: p.process_name,
    documentName: p.document_name,
    version: p.version,
    progress: p.progress,
    docStatus: p.doc_status,
    statusPercentage: p.status_percentage,
    priority: p.priority,
    targetDate: p.target_date,
    processOwner: p.process_owner,
    updateDate: p.update_date,
    remarks: p.remarks,
    reviewDate: p.review_date,
    file_url: p.file_url,
    file_name: p.file_name,
    file_size: p.file_size ? Number(p.file_size) : null,
    file_type: p.file_type,
    uploaded_at: p.uploaded_at,
    linkedDocuments: p.linkedDocuments || [],
    fileVersions: p.fileVersions?.map(fv => ({
      id: fv.id,
      business_process_id: fv.business_process_id,
      process_version: fv.process_version,
      file_url: fv.file_url,
      file_name: fv.file_name,
      file_size: fv.file_size ? Number(fv.file_size) : null,
      file_type: fv.file_type,
      uploaded_at: fv.uploaded_at,
      uploaded_by: fv.uploaded_by,
      uploadedBy: fv.uploadedBy
    })) || [],
  };
};

// Helper function to transform frontend camelCase to API snake_case
const transformFrontendToAPI = (frontendData: unknown) => {
  const f = frontendData as {
    subBusinessArea?: string;
    processName: string;
    documentName?: string;
    version?: string;
    progress?: string;
    docStatus?: string;
    statusPercentage?: number;
    priority?: string;
    targetDate?: string;
    processOwner?: string;
    remarks?: string;
    reviewDate?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    uploaded_at?: string;
  };
  return {
    sub_business_area: f.subBusinessArea,
    process_name: f.processName,
    document_name: f.documentName,
    version: f.version,
    progress: f.progress,
    doc_status: f.docStatus,
    status_percentage: f.statusPercentage,
    priority: f.priority,
    target_date: f.targetDate,
    process_owner: f.processOwner,
    remarks: f.remarks,
    review_date: f.reviewDate,
    file_url: f.file_url,
    file_name: f.file_name,
    file_size: f.file_size,
    file_type: f.file_type,
    uploaded_at: f.uploaded_at ? new Date(f.uploaded_at) : null,
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if id is "new" - this is not a valid ID for fetching
    if (id === 'new') {
      return NextResponse.json(
        { error: 'Invalid process ID' },
        { status: 400 }
      );
    }

    // Validate that id is a number
    const processId = Number(id);
    if (isNaN(processId)) {
      return NextResponse.json(
        { error: 'Invalid process ID format' },
        { status: 400 }
      );
    }

    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const process = await prisma.businessProcessRegister.findFirst({
      where: {
        id: processId,
        business_area: {
          in: userBusinessAreas
        }
      },
      include: {
        businessareas: true,
        linkedDocuments: {
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

    if (!process) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }

    const transformedProcess = transformBusinessProcess(process);
    return NextResponse.json(transformedProcess);
  } catch (error) {
    console.error('Failed to fetch process:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const frontendData = await request.json();
    const data = transformFrontendToAPI(frontendData);
    
    const {
      sub_business_area,
      process_name,
      document_name,
      version,
      progress,
      doc_status,
      status_percentage,
      priority,
      target_date,
      process_owner,
      remarks,
      review_date,
      file_url,
      file_name,
      file_size,
      file_type,
      uploaded_at,
    } = data;

    // Validate required fields
    if (!process_name) {
      return NextResponse.json(
        { error: 'Process name is required' },
        { status: 400 }
      );
    }

    // Validate status_percentage is between 0 and 100
    if (status_percentage !== null && status_percentage !== undefined) {
      const percentage = Number(status_percentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        return NextResponse.json(
          { error: 'Status percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Get current process to check if file is being changed
    const currentProcess = await prisma.businessProcessRegister.findFirst({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    if (!currentProcess) {
      return NextResponse.json(
        { error: 'Process not found' },
        { status: 404 }
      );
    }

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (file_url && file_url !== currentProcess.file_url && currentProcess.file_url && currentProcess.version) {
      await prisma.businessProcessFileVersion.create({
        data: {
          business_process_id: Number(id),
          process_version: currentProcess.version,
          file_url: currentProcess.file_url,
          file_name: currentProcess.file_name || '',
          file_size: currentProcess.file_size,
          file_type: currentProcess.file_type,
          uploaded_by: userId
        }
      });
    }

    const updatedProcess = await prisma.businessProcessRegister.updateMany({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
      },
      data: {
        sub_business_area: sub_business_area,
        process_name: process_name,
        document_name: document_name,
        version: version,
        progress: progress,
        doc_status: doc_status,
        status_percentage: status_percentage,
        priority: priority,
        target_date: target_date ? new Date(target_date) : null,
        process_owner: process_owner,
        update_date: new Date(),
        remarks: remarks,
        review_date: review_date ? new Date(review_date) : null,
        file_url: file_url,
        file_name: file_name,
        file_size: file_size,
        file_type: file_type,
        uploaded_at: uploaded_at
      }
    });

    if (updatedProcess.count === 0) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }

    // Fetch the updated record
    const updatedRecord = await prisma.businessProcessRegister.findFirst({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
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
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }

    const transformedProcess = transformBusinessProcess(updatedRecord);
    return NextResponse.json(transformedProcess);
  } catch (error) {
    console.error('Failed to update process:', error);
    return NextResponse.json(
      { error: 'Failed to update process' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const deletedProcess = await prisma.businessProcessRegister.deleteMany({
      where: {
        id: Number(id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    if (deletedProcess.count === 0) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Process deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete process:', error);
    return NextResponse.json(
      { error: 'Failed to delete process' }, 
      { status: 500 }
    );
  }
} 