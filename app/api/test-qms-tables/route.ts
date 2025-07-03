import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test if QMS tables exist
    const tables = await query(`
      SHOW TABLES LIKE 'qms_%'
    `);

    console.log('QMS tables found:', tables);

    // Test if qms_assessments table exists and has data
    const assessmentsCount = await query(`
      SELECT COUNT(*) as count FROM qms_assessments
    `);

    console.log('Assessments count:', assessmentsCount);

    // Test if qms_assessment_items table exists
    const itemsCount = await query(`
      SELECT COUNT(*) as count FROM qms_assessment_items
    `);

    console.log('Items count:', itemsCount);

    // Test if qms_approval table exists
    const approvalCount = await query(`
      SELECT COUNT(*) as count FROM qms_approval
    `);

    console.log('Approval count:', approvalCount);

    return NextResponse.json({
      success: true,
      data: {
        tables: tables,
        assessmentsCount: assessmentsCount[0]?.count || 0,
        itemsCount: itemsCount[0]?.count || 0,
        approvalCount: approvalCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error testing QMS tables:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test QMS tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 