import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test if QMS tables exist
    const tables = await query(`
      SHOW TABLES LIKE 'qms_%'
    `);

    console.log('QMS tables found:', tables);

    // Test if qms_assessments table exists and has data
    const assessmentsCountResult = await query(`
      SELECT COUNT(*) as count FROM qms_assessments
    `);

    console.log('Assessments count:', assessmentsCountResult);

    // Test if qms_assessment_items table exists
    const itemsCountResult = await query(`
      SELECT COUNT(*) as count FROM qms_assessment_items
    `);

    console.log('Items count:', itemsCountResult);

    // Test if qms_approval table exists
    const approvalCountResult = await query(`
      SELECT COUNT(*) as count FROM qms_approval
    `);

    console.log('Approval count:', approvalCountResult);

    const assessmentsCount = assessmentsCountResult[0] as { count: number } || { count: 0 };
    const itemsCount = itemsCountResult[0] as { count: number } || { count: 0 };
    const approvalCount = approvalCountResult[0] as { count: number } || { count: 0 };

    return NextResponse.json({
      success: true,
      data: {
        tables: tables,
        assessmentsCount: assessmentsCount.count,
        itemsCount: itemsCount.count,
        approvalCount: approvalCount.count
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