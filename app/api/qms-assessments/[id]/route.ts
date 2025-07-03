import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

/**
 * QMS Assessment Detail API Route
 * 
 * Handles retrieving and updating a single QMS assessment with all its items and approval details
 * 
 * @route GET /api/qms-assessments/[id] - Get assessment by ID
 * @route PUT /api/qms-assessments/[id] - Update assessment by ID
 */

/**
 * GET handler - Retrieves a single QMS assessment by ID
 * @param request - Next.js request object
 * @param params - Route parameters containing the assessment ID
 * @returns JSON response with assessment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = parseInt(params.id);
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);

    if (isNaN(assessmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }

    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching assessment:', { assessmentId, userBusinessAreas });

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [assessmentId, ...userBusinessAreas];

    console.log('SQL Query:', `
      SELECT id, business_area, assessor_name, assessment_date, created_at
      FROM qms_assessments 
      WHERE id = ? AND business_area IN (${placeholders})
    `);
    console.log('Query parameters:', queryParams);

    // Get the assessment
    const [assessment] = await query(`
      SELECT id, business_area, assessor_name, assessment_date, created_at
      FROM qms_assessments 
      WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    console.log('Assessment result:', assessment);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get assessment items
    const items = await query(`
      SELECT id, section, clause_reference, item_number, item_description, status, comment
      FROM qms_assessment_items 
      WHERE assessment_id = ?
      ORDER BY section ASC, item_number ASC
    `, [assessmentId]);

    console.log('Items result:', items);

    // Get approval details
    const [approval] = await query(`
      SELECT id, conducted_by, conducted_date, approved_by, approved_date
      FROM qms_approvals 
      WHERE assessment_id = ?
    `, [assessmentId]);

    console.log('Approval result:', approval);

    // Transform data for frontend
    const transformedAssessment = {
      id: assessment.id,
      businessArea: assessment.business_area,
      assessorName: assessment.assessor_name,
      assessmentDate: assessment.assessment_date.toISOString().split('T')[0],
      createdAt: assessment.created_at.toISOString().split('T')[0],
      items: items.map((item: any) => ({
        id: item.id,
        section: item.section,
        clauseReference: item.clause_reference,
        itemNumber: item.item_number,
        itemDescription: item.item_description,
        status: item.status,
        comment: item.comment
      })),
      approval: approval ? {
        id: approval.id,
        conductedBy: approval.conducted_by,
        conductedDate: approval.conducted_date?.toISOString().split('T')[0],
        approvedBy: approval.approved_by,
        approvedDate: approval.approved_date?.toISOString().split('T')[0]
      } : null
    };

    return NextResponse.json({
      success: true,
      data: transformedAssessment
    });
  } catch (error) {
    console.error('Error fetching QMS assessment:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      errno: error instanceof Error && 'errno' in error ? (error as any).errno : undefined,
      sqlMessage: error instanceof Error && 'sqlMessage' in error ? (error as any).sqlMessage : undefined,
      sqlState: error instanceof Error && 'sqlState' in error ? (error as any).sqlState : undefined
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Updates a single QMS assessment by ID
 * @param request - Next.js request object
 * @param params - Route parameters containing the assessment ID
 * @returns JSON response with updated assessment details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = parseInt(params.id);
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);

    if (isNaN(assessmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }

    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [assessmentId, ...userBusinessAreas];

    // First, check if the assessment exists and user has access
    const [existingAssessment] = await query(`
      SELECT id, business_area FROM qms_assessments WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { businessArea, assessorName, assessmentDate, items, approval } = body;

    // Check if user has access to the specified business area
    if (!userBusinessAreas.includes(businessArea)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to modify assessment for this business area' },
        { status: 403 }
      );
    }

    // Update the main assessment
    await query(`
      UPDATE qms_assessments 
      SET business_area = ?, assessor_name = ?, assessment_date = ?
      WHERE id = ? AND business_area IN (${placeholders})
    `, [businessArea, assessorName, new Date(assessmentDate), assessmentId, ...userBusinessAreas]);

    // Update assessment items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(`
          UPDATE qms_assessment_items 
          SET status = ?, comment = ?
          WHERE id = ? AND assessment_id = ?
        `, [item.status, item.comment || null, item.id, assessmentId]);
      }
    }

    // Update approval if provided
    if (approval) {
      await query(`
        UPDATE qms_approvals 
        SET conducted_by = ?, conducted_date = ?, approved_by = ?, approved_date = ?
        WHERE assessment_id = ?
      `, [
        approval.conductedBy || null,
        approval.conductedDate ? new Date(approval.conductedDate) : null,
        approval.approvedBy || null,
        approval.approvedDate ? new Date(approval.approvedDate) : null,
        assessmentId
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment updated successfully'
    });
  } catch (error) {
    console.error('Error updating QMS assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Deletes a single QMS assessment by ID
 * @param request - Next.js request object
 * @param params - Route parameters containing the assessment ID
 * @returns JSON response with deletion confirmation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = parseInt(params.id);
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);

    if (isNaN(assessmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }

    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [assessmentId, ...userBusinessAreas];

    // Check if the assessment exists and user has access
    const [existingAssessment] = await query(`
      SELECT id FROM qms_assessments WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Delete the assessment (cascade will handle items and approval)
    await query(`
      DELETE FROM qms_assessments WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QMS assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
} 