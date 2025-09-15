import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Test QMS Assessments API Route
 * 
 * This endpoint tests the QMS assessments functionality to help debug issues
 * 
 * @route GET /api/test-qms-assessments - Test QMS assessments functionality
 */

export async function GET() {
  try {
    console.log('Testing QMS assessments functionality...');

    // Test 1: Check if qms_assessments table exists and has data
    let assessments;
    try {
      assessments = await query(`
        SELECT 
          qa.id,
          qa.business_area,
          qa.assessor_name,
          qa.assessment_date,
          qa.created_at,
          COUNT(qai.id) as item_count
        FROM qms_assessments qa
        LEFT JOIN qms_assessment_items qai ON qa.id = qai.assessment_id
        GROUP BY qa.id, qa.business_area, qa.assessor_name, qa.assessment_date, qa.created_at
        ORDER BY qa.created_at DESC
        LIMIT 5
      `);
      console.log('QMS assessments query successful:', assessments.length, 'assessments found');
    } catch (error) {
      console.error('Error querying qms_assessments table:', error);
      return NextResponse.json({
        success: false,
        error: 'QMS assessments table query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test 2: Check if qms_assessment_items table exists and has data
    let items;
    try {
      items = await query(`
        SELECT COUNT(*) as item_count FROM qms_assessment_items
      `);
      console.log('QMS assessment items query successful:', items[0]?.item_count, 'items found');
    } catch (error) {
      console.error('Error querying qms_assessment_items table:', error);
      return NextResponse.json({
        success: false,
        error: 'QMS assessment items table query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test 3: Check if qms_approvals table exists and has data
    let approvals;
    try {
      approvals = await query(`
        SELECT COUNT(*) as approval_count FROM qms_approvals
      `);
      console.log('QMS approvals query successful:', approvals[0]?.approval_count, 'approvals found');
    } catch (error) {
      console.error('Error querying qms_approvals table:', error);
      return NextResponse.json({
        success: false,
        error: 'QMS approvals table query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test 4: Check business areas
    let businessAreas;
    try {
      businessAreas = await query(`
        SELECT business_area FROM businessareas LIMIT 10
      `);
      console.log('Business areas query successful:', businessAreas.length, 'business areas found');
    } catch (error) {
      console.error('Error querying businessareas table:', error);
      return NextResponse.json({
        success: false,
        error: 'Business areas table query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'QMS assessments functionality test completed successfully',
      data: {
        assessments: {
          count: assessments.length,
          sample: assessments.slice(0, 2) // Show first 2 assessments
        },
        items: {
          count: items[0]?.item_count || 0
        },
        approvals: {
          count: approvals[0]?.approval_count || 0
        },
        businessAreas: {
          count: businessAreas.length,
          sample: businessAreas.slice(0, 5).map((ba: unknown) => (ba as { business_area: string }).business_area) // Show first 5 business areas
        }
      }
    });

  } catch (error) {
    console.error('Error in QMS assessments test:', error);
    return NextResponse.json({
      success: false,
      error: 'QMS assessments test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 