import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('Check both databases endpoint called');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Get the DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not available');
    }
    
    // Parse the URL manually to avoid decodeURIComponent issues
    const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, username, password, host, port, databaseName] = urlMatch;
    
    const results: any = {
      database_qms_1: {},
      qmstool: {}
    };
    
    // Check database-qms-1
    console.log('Checking database-qms-1...');
    try {
      const connection1 = await mysql.createConnection({
        host,
        port: parseInt(port),
        user: username,
        password: password,
        database: 'database-qms-1',
      });
      
      const [tables1] = await connection1.execute('SHOW TABLES');
      results.database_qms_1 = {
        exists: true,
        tables: tables1,
        tableCount: (tables1 as any[]).length
      };
      
      await connection1.end();
    } catch (error) {
      results.database_qms_1 = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Check qmstool database
    console.log('Checking qmstool database...');
    try {
      const connection2 = await mysql.createConnection({
        host,
        port: parseInt(port),
        user: username,
        password: password,
        database: 'qmstool',
      });
      
      const [tables2] = await connection2.execute('SHOW TABLES');
      results.qmstool = {
        exists: true,
        tables: tables2,
        tableCount: (tables2 as any[]).length
      };
      
      await connection2.end();
    } catch (error) {
      results.qmstool = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Both databases checked successfully',
      results: results,
      recommendation: results.qmstool.exists && results.qmstool.tableCount > 0 
        ? 'Your application data appears to be in the qmstool database. Consider updating the Lambda function to use qmstool instead of database-qms-1.'
        : 'Both databases are accessible. Check which one contains your application data.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Check both databases error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
