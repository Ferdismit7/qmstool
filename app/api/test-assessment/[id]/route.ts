import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * Test Assessment API Route
 * 
 * This endpoint tests if a specific assessment exists in the database
 * 
 * @route GET /api/test-assessment/[id] - Test if assessment exists
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = parseInt(params.id);
    
    if (isNaN(assessmentId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid assessment ID'
      }, { status: 400 });
    }

    console.log('Testing assessment ID:', assessmentId);

    // Check if assessment exists without business area filtering
    const [assessment] = await query(`
      SELECT id, business_area, assessor_name, assessment_date, created_at
      FROM qms_assessments 
      WHERE id = ?
    `, [assessmentId]);

    console.log('Assessment found:', assessment);

    if (!assessment) {
      return NextResponse.json({
        success: false,
        error: 'Assessment not found in database',
        assessmentId
      }, { status: 404 });
    }

    // Get assessment items
    const items = await query(`
      SELECT id, section, clause_reference, item_number, item_description, status, comment
      FROM qms_assessment_items 
      WHERE assessment_id = ?
      ORDER BY section ASC, item_number ASC
    `, [assessmentId]);

    console.log('Assessment items found:', items.length);

    // Get approval details
    const [approval] = await query(`
      SELECT id, conducted_by, conducted_date, approved_by, approved_date
      FROM qms_approvals 
      WHERE assessment_id = ?
    `, [assessmentId]);

    console.log('Approval found:', approval);

    return NextResponse.json({
      success: true,
      message: 'Assessment found in database',
      data: {
        assessment: {
          id: assessment.id,
          businessArea: assessment.business_area,
          assessorName: assessment.assessor_name,
          assessmentDate: assessment.assessment_date,
          createdAt: assessment.created_at
        },
        items: {
          count: items.length,
          sample: items.slice(0, 3) // Show first 3 items
        },
        approval: approval ? {
          id: approval.id,
          conductedBy: approval.conducted_by,
          conductedDate: approval.conducted_date,
          approvedBy: approval.approved_by,
          approvedDate: approval.approved_date
        } : null
      }
    });

  } catch (error) {
    console.error('Error testing assessment:', error);
    return NextResponse.json({
      success: false,
      error: 'Error testing assessment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 