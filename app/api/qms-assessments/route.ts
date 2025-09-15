import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';
import { QMSAssessmentData } from '@/app/types/qmsAssessment';

/**
 * QMS Assessments API Route
 * 
 * Handles creating and fetching QMS assessments with business area filtering
 * 
 * @route GET /api/qms-assessments - Get all assessments for current user's business area
 * @route POST /api/qms-assessments - Create new assessment with items
 */



// Helper function to transform database fields to frontend expected format
const transformAssessment = (dbAssessment: unknown) => {
  const a = dbAssessment as {
    id: number;
    business_area: string;
    assessor_name: string;
    assessment_date: string;
    created_at: string;
    items: Array<unknown>;
    approval?: unknown;
  };
  return {
    id: a.id,
    businessArea: a.business_area || '',
    assessorName: a.assessor_name || '',
    assessmentDate: a.assessment_date,
    createdAt: a.created_at,
    items: a.items,
    approval: a.approval,
  };
};

/**
 * GET handler - Retrieves all QMS assessments for the current user's business area
 * @param request - Next.js request object
 * @returns JSON response with filtered assessments
 */
export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    
    const assessments = await query(`
      SELECT 
        qa.id,
        qa.business_area,
        qa.assessor_name,
        qa.assessment_date,
        qa.created_at,
        COUNT(qai.id) as item_count
      FROM qms_assessments qa
      LEFT JOIN qms_assessment_items qai ON qa.id = qai.assessment_id
      WHERE qa.business_area IN (${placeholders})
      GROUP BY qa.id, qa.business_area, qa.assessor_name, qa.assessment_date, qa.created_at
      ORDER BY qa.created_at DESC
    `, userBusinessAreas);

    return NextResponse.json({
      success: true,
      data: (assessments || []).map(transformAssessment)
    });
  } catch (error) {
    console.error('Error fetching QMS assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QMS assessments' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Creates a new QMS assessment with all items
 * @param request - Next.js request object
 * @returns JSON response with created assessment
 */
export async function POST(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData: QMSAssessmentData = await request.json();
    
    // Extract metadata from form data
    const businessArea = formData.businessArea;
    const assessor = formData.assessor;
    const assessmentDate = formData.assessmentDate || formData.assessmentDateRange?.start;

    // Validate required fields
    if (!businessArea || !assessor || !assessmentDate) {
      return NextResponse.json(
        { error: 'Business area, assessor, and assessment date are required' },
        { status: 400 }
      );
    }

    // Check if user has access to the specified business area
    if (!userBusinessAreas.includes(businessArea)) {
      return NextResponse.json(
        { error: 'Unauthorized to create assessment for this business area' },
        { status: 403 }
      );
    }

    // Start a transaction to create assessment and items
    await query('START TRANSACTION');

    try {
      // Create the main assessment record
      const assessmentResult = await query(`
        INSERT INTO qms_assessments (business_area, assessor_name, assessment_date)
        VALUES (?, ?, ?)
      `, [businessArea, assessor, new Date(assessmentDate)]) as { insertId: number };

      const assessmentId = assessmentResult.insertId;

      // Create assessment items for all sections
      const itemsToInsert: Array<{
        assessmentId: number;
        section: string;
        clauseReference: string;
        itemNumber: string;
        itemDescription: string;
        status: string;
        comment: string | null;
      }> = [];

      // Process Section 1: Quality Management System & Processes
      Object.entries(formData.section1).forEach(([itemNumber, item]) => {
        if (item.status) {
          itemsToInsert.push({
            assessmentId,
            section: '1',
            clauseReference: 'Clause 4.2/4.4/6.1/6.2/7',
            itemNumber,
            itemDescription: getItemDescription('1', itemNumber),
            status: item.status,
            comment: item.comment || null
          });
        }
      });

      // Process Section 2: Support – Resources, Competence, Awareness
      Object.entries(formData.section2).forEach(([itemNumber, item]) => {
        if (item.status) {
          itemsToInsert.push({
            assessmentId,
            section: '2',
            clauseReference: 'Clause 7',
            itemNumber,
            itemDescription: getItemDescription('2', itemNumber),
            status: item.status,
            comment: item.comment || null
          });
        }
      });

      // Process Section 3: Operations
      Object.entries(formData.section3).forEach(([itemNumber, item]) => {
        if (item.status) {
          itemsToInsert.push({
            assessmentId,
            section: '3',
            clauseReference: 'Clause 8',
            itemNumber,
            itemDescription: getItemDescription('3', itemNumber),
            status: item.status,
            comment: item.comment || null
          });
        }
      });

      // Process Section 4: Performance Monitoring & Improvement
      Object.entries(formData.section4).forEach(([itemNumber, item]) => {
        if (item.status) {
          itemsToInsert.push({
            assessmentId,
            section: '4',
            clauseReference: 'Clauses 9 & 10',
            itemNumber,
            itemDescription: getItemDescription('4', itemNumber),
            status: item.status,
            comment: item.comment || null
          });
        }
      });

      // Insert all assessment items
      for (const item of itemsToInsert as Array<{
        assessmentId: number;
        section: string;
        clauseReference: string;
        itemNumber: string;
        itemDescription: string;
        status: string;
        comment: string | null;
      }>) {
        await query(`
          INSERT INTO qms_assessment_items (
            assessment_id, section, clause_reference, item_number, 
            item_description, status, comment
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          item.assessmentId,
          item.section,
          item.clauseReference,
          item.itemNumber,
          item.itemDescription,
          item.status,
          item.comment
        ]);
      }

      // Create approval record if approval data is provided
      if (formData.assessmentConductedBy || formData.approvedByGoverningBody) {
        await query(`
          INSERT INTO qms_approvals (
            assessment_id, conducted_by, conducted_date, approved_by, approved_date
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          assessmentId,
          formData.assessmentConductedBy || null,
          formData.assessorDate ? new Date(formData.assessorDate) : null,
          formData.approvedByGoverningBody || null,
          formData.approvalDate ? new Date(formData.approvalDate) : null
        ]);
      }

      // Commit the transaction
      await query('COMMIT');

      return NextResponse.json({ 
        success: true,
        id: assessmentId,
        businessArea,
        assessor,
        assessmentDate,
        itemCount: itemsToInsert.length,
        created_at: new Date()
      }, { status: 201 });

    } catch (error) {
      // Rollback on error
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating QMS assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create QMS assessment' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get item descriptions
 * @param section - The section number
 * @param itemNumber - The item number
 * @returns The item description
 */
function getItemDescription(section: string, itemNumber: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    '1': {
      '1.1': 'Business/workflow processes documented with inputs and outputs',
      '1.2': 'Evidence of evaluating/improving business processes',
      '1.3': 'SOP documentation is effective, measurable, usable, and protected',
      '1.4': 'QMS responsibilities are assigned and documented',
      '1.5': 'Needs/expectations of interested parties identified and risks assessed',
      '1.6': 'Statutory, regulatory, and customer requirements consistently met',
      '1.7': 'QMS objectives are SMART and reviewed regularly',
      '1.8': 'Confidentiality maintained in line with POPIA and internal policies'
    },
    '2': {
      '2.1': 'Adequate human resources for QMS operation',
      '2.2': 'Personnel are competent via education, training, or experience',
      '2.3': 'Adequate facilities/equipment available and maintained',
      '2.4': 'Employees aware of QMS policies and their role in quality objectives'
    },
    '3': {
      '3.1': 'Operational processes planned and controlled according to client requirements',
      '3.2': 'Monitoring and measuring of business processes and service delivery',
      '3.3': 'Quality assurance in place: abnormalities tracked, work traceable',
      '3.4': 'Client communication and confirmation of service/product delivery'
    },
    '4': {
      '4.1': 'QMS reviewed regularly; improvement actions implemented',
      '4.2': 'Service level turnaround time monitored and corrective action taken',
      '4.3': 'External service providers evaluated, where applicable',
      '4.4': 'Customer satisfaction monitored and communicated',
      '4.5': 'Compliments and appeals tracked and communicated',
      '4.6': 'Complaints/corrective actions recorded and used for continual improvement'
    }
  };

  return descriptions[section]?.[itemNumber] || 'Unknown item';
} 