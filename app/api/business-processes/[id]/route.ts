import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

// Helper function to transform database fields to component expected format
const transformBusinessProcess = (dbProcess: any) => ({
  id: dbProcess.id,
  businessArea: dbProcess.business_area,
  subBusinessArea: dbProcess.sub_business_area,
  processName: dbProcess.process_name,
  documentName: dbProcess.document_name,
  version: dbProcess.version,
  progress: dbProcess.progress,
  docStatus: dbProcess.doc_status,
  statusPercentage: dbProcess.status_percentage,
  priority: dbProcess.priority,
  targetDate: dbProcess.target_date,
  processOwner: dbProcess.process_owner,
  updateDate: dbProcess.update_date,
  remarks: dbProcess.remarks,
  reviewDate: dbProcess.review_date,
});

// Helper function to transform frontend camelCase to API snake_case
const transformFrontendToAPI = (frontendData: any) => ({
  sub_business_area: frontendData.subBusinessArea,
  process_name: frontendData.processName,
  document_name: frontendData.documentName,
  version: frontendData.version,
  progress: frontendData.progress,
  doc_status: frontendData.docStatus,
  status_percentage: frontendData.statusPercentage,
  priority: frontendData.priority,
  target_date: frontendData.targetDate,
  process_owner: frontendData.processOwner,
  remarks: frontendData.remarks,
  review_date: frontendData.reviewDate,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const process = await prisma.businessProcessRegister.findFirst({
      where: {
        id: Number(params.id),
        business_area: {
          in: userBusinessAreas
        }
      },
      include: {
        businessareas: true
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
  { params }: { params: { id: string } }
) {
  try {
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

    const updatedProcess = await prisma.businessProcessRegister.updateMany({
      where: {
        id: Number(params.id),
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
        review_date: review_date ? new Date(review_date) : null
      }
    });

    if (updatedProcess.count === 0) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }

    // Fetch the updated record
    const process = await prisma.businessProcessRegister.findFirst({
      where: {
        id: Number(params.id),
        business_area: {
          in: userBusinessAreas
        }
      },
      include: {
        businessareas: true
      }
    });

    const transformedProcess = transformBusinessProcess(process);
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
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    const result = await prisma.businessProcessRegister.deleteMany({
      where: {
        id: Number(params.id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete process:', error);
    return NextResponse.json(
      { error: 'Failed to delete process' }, 
      { status: 500 }
    );
  }
} 