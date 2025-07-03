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
    
    const businessProcesses = await query(`
      SELECT bpr.*, ba.business_area 
      FROM businessprocessregister bpr
      LEFT JOIN businessareas ba ON bpr.business_area = ba.business_area
      WHERE bpr.business_area IN (${placeholders})
      ORDER BY bpr.update_date DESC
    `, userBusinessAreas);

    // Transform the data to match component expectations
    const transformedProcesses = businessProcesses.map(transformBusinessProcess);

    return NextResponse.json(transformedProcesses);
  } catch (error) {
    console.error('Error fetching business processes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business processes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Use the first business area for new records (or you could add a business_area field to the form)
    const userBusinessArea = userBusinessAreas[0];

    const result = await query(`
      INSERT INTO businessprocessregister (
        business_area, sub_business_area, process_name, document_name, 
        version, progress, doc_status, status_percentage, priority, 
        target_date, process_owner, update_date, remarks, review_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `, [
      userBusinessArea, sub_business_area, process_name, document_name,
      version || '1.0', progress || 'NOT_STARTED', doc_status || 'DRAFT',
      status_percentage, priority, target_date ? new Date(target_date) : null,
      process_owner, remarks, review_date ? new Date(review_date) : null
    ]);

    // Fetch the created record
    const [businessProcess] = await query(`
      SELECT bpr.*, ba.business_area 
      FROM businessprocessregister bpr
      LEFT JOIN businessareas ba ON bpr.business_area = ba.business_area
      WHERE bpr.id = ?
    `, [result.insertId]);

    // Transform the response
    const transformedProcess = transformBusinessProcess(businessProcess);

    return NextResponse.json(transformedProcess, { status: 201 });
  } catch (error) {
    console.error('Error creating business process:', error);
    return NextResponse.json(
      { error: 'Failed to create business process' },
      { status: 500 }
    );
  }
} 