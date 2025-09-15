import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database tables...');
    
    // Get all table names
    const tables = await query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY TABLE_NAME
    `);
    
    console.log('Found tables:', tables);
    
    // Check specific tables that should exist
    const expectedTables = [
      'businessareas',
      'businessdocumentregister', 
      'businessprocessregister',
      'businessqualityobjectives',
      'performancemonitoringcontrol',
      'racm_matrix',
      'trainingsessions',
      'users',
      'user_business_areas'
    ];
    
    const existingTableNames = tables.map((t: Record<string, unknown>) => (t.TABLE_NAME as string).toLowerCase());
    const missingTables = expectedTables.filter(table => !existingTableNames.includes(table));
    const foundTables = expectedTables.filter(table => existingTableNames.includes(table));
    
    return NextResponse.json({
      success: true,
      message: 'Database tables check completed',
      allTables: tables.map((t: Record<string, unknown>) => t.TABLE_NAME as string),
      expectedTables,
      foundTables,
      missingTables,
      totalTables: tables.length
    });
  } catch (error) {
    console.error('Test tables error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 