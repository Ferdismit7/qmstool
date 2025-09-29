import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('List databases endpoint called');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Get the DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not available');
    }
    
    console.log('DATABASE_URL:', databaseUrl);
    
    // Parse the URL manually to avoid decodeURIComponent issues
    const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, username, password, host, port, databaseName] = urlMatch;
    
    console.log('Connection details:', {
      host,
      port: parseInt(port),
      username,
      databaseName,
      passwordLength: password.length
    });
    
    // Connect to the RDS instance without specifying a database
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password: password, // Use the password as-is without decoding
      // Don't specify database - connect to the server directly
    });
    
    console.log('✅ Connected to RDS instance successfully');
    
    // List all databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:', databases);
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      message: 'Database listing completed',
      availableDatabases: databases,
      connectionDetails: {
        host,
        port: parseInt(port),
        username,
        requestedDatabase: databaseName
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('List databases error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
