import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Create user_business_areas table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS user_business_areas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        business_area VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE CASCADE,
        UNIQUE KEY unique_user_business (user_id, business_area)
      )
    `);

    // Check if table was created successfully
    const tableExistsResult = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'user_business_areas'
    `);

    const tableExists = tableExistsResult[0] as { count: number };

    if (tableExists.count > 0) {
      return NextResponse.json({
        message: 'user_business_areas table setup completed successfully',
        status: 'success'
      });
    } else {
      return NextResponse.json({
        message: 'Failed to create user_business_areas table',
        status: 'error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error setting up user_business_areas table:', error);
    return NextResponse.json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
} 