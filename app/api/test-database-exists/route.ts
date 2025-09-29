import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database existence endpoint called');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Test 1: Try to connect to the current database
    console.log('Step 1: Testing current database connection...');
    try {
      const result = await query('SELECT DATABASE() as current_db');
      console.log('✅ Current database connection successful:', result);
    } catch (error) {
      console.error('❌ Current database connection failed:', error);
    }
    
    // Test 2: Try to list all databases
    console.log('Step 2: Testing database listing...');
    try {
      const databases = await query('SHOW DATABASES');
      console.log('✅ Database listing successful:', databases);
    } catch (error) {
      console.error('❌ Database listing failed:', error);
    }
    
    // Test 3: Try to connect to a different database name
    console.log('Step 3: Testing alternative database names...');
    const alternativeNames = ['qms', 'qms_tool', 'main', 'default'];
    
    for (const dbName of alternativeNames) {
      try {
        // Temporarily change the database URL
        const originalUrl = process.env.DATABASE_URL;
        if (originalUrl) {
          const newUrl = originalUrl.replace(/\/[^\/]+$/, `/${dbName}`);
          process.env.DATABASE_URL = newUrl;
          
          // Try to connect
          await query('SELECT 1 as test');
          console.log(`✅ Database '${dbName}' exists and is accessible`);
          break;
        }
      } catch (error) {
        console.log(`❌ Database '${dbName}' not accessible:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database existence test completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database existence test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
