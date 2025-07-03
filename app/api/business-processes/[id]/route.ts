import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
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

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, Number(params.id)];

    const [process] = await query(`
      SELECT bpr.*, ba.business_area 
      FROM businessprocessregister bpr
      LEFT JOIN businessareas ba ON bpr.business_area = ba.business_area
      WHERE bpr.id = ? AND bpr.business_area IN (${placeholders})
    `, queryParams);

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

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, Number(params.id)];

    // Use the first business area for updates
    const userBusinessArea = userBusinessAreas[0];

    const result = await query(`
      UPDATE businessprocessregister SET
        sub_business_area = ?, process_name = ?, document_name = ?,
        version = ?, progress = ?, doc_status = ?, status_percentage = ?, priority = ?,
        target_date = ?, process_owner = ?, update_date = NOW(), remarks = ?, review_date = ?
      WHERE id = ? AND business_area IN (${placeholders})
    `, [
      sub_business_area, process_name, document_name,
      version, progress, doc_status, status_percentage, priority,
      target_date ? new Date(target_date) : null, process_owner, remarks,
      review_date ? new Date(review_date) : null, Number(params.id), ...userBusinessAreas
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Process not found' }, 
        { status: 404 }
      );
    }

    // Fetch the updated record
    const [updatedProcess] = await query(`
      SELECT bpr.*, ba.business_area 
      FROM businessprocessregister bpr
      LEFT JOIN businessareas ba ON bpr.business_area = ba.business_area
      WHERE bpr.id = ? AND bpr.business_area IN (${placeholders})
    `, [Number(params.id), ...userBusinessAreas]);

    const transformedProcess = transformBusinessProcess(updatedProcess);
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

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, Number(params.id)];

    const result = await query(`
      DELETE FROM businessprocessregister WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    if (result.affectedRows === 0) {
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