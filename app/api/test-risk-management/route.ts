import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    // Test database connection
    const connection = await query('SELECT 1');
    console.log('Database connection test:', connection);

    // Check if table exists
    const tableExists = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'racm_matrix'
    `);
    console.log('Table exists check:', tableExists);

    // Get table structure
    const tableStructure = await query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'racm_matrix'
      AND TABLE_SCHEMA = DATABASE()
    `);
    console.log('Table structure:', tableStructure);

    // Create table if it doesn't exist
    if (tableExists[0].count === 0) {
      console.log('Creating racm_matrix table...');
      await query(`
        CREATE TABLE racm_matrix (
          id INT AUTO_INCREMENT PRIMARY KEY,
          process_name VARCHAR(255) NOT NULL,
          activity_description TEXT,
          issue_description TEXT NOT NULL,
          issue_type VARCHAR(255),
          likelihood INT,
          impact INT,
          risk_score INT,
          control_description TEXT,
          control_type ENUM('Preventive', 'Detective', 'Corrective'),
          control_owner VARCHAR(255),
          control_effectiveness ENUM('High', 'Medium', 'Low'),
          residual_risk INT,
          status ENUM('Open', 'Under Review', 'Closed'),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Table created successfully');
    }

    return NextResponse.json({
      connection: 'success',
      tableExists: tableExists[0].count > 0,
      tableStructure
    });
  } catch (error) {
    console.error('Test Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 