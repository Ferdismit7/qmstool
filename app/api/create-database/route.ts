import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Creating database endpoint called');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Try to create the database
    console.log('Step 1: Creating database...');
    try {
      // First, connect without specifying a database
      const originalUrl = process.env.DATABASE_URL;
      if (originalUrl) {
        // Remove the database name from the URL to connect to the server
        const serverUrl = originalUrl.replace(/\/[^\/]+$/, '');
        process.env.DATABASE_URL = serverUrl;
        
        // Create the database
        await query('CREATE DATABASE IF NOT EXISTS `database-qms-1`');
        console.log('✅ Database created successfully');
        
        // Restore the original URL
        process.env.DATABASE_URL = originalUrl;
        
        // Test connection to the created database
        const result = await query('SELECT DATABASE() as current_db');
        console.log('✅ Connected to database:', result);
        
        return NextResponse.json({
          success: true,
          message: 'Database created and connected successfully',
          database: result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Database creation failed:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Database creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
