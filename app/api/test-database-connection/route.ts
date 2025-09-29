import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('Test database connection endpoint called');
    
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
    
    // Test 1: Connect to the server without specifying a database
    console.log('Test 1: Connecting to server without database...');
    const serverConnection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password: password,
      // Don't specify database - connect to the server directly
    });
    
    console.log('✅ Connected to RDS server successfully');
    
    // Test 2: List all databases
    console.log('Test 2: Listing all databases...');
    const [databases] = await serverConnection.execute('SHOW DATABASES');
    console.log('Available databases:', databases);
    
    await serverConnection.end();
    
    // Test 3: Try to connect to the specific database
    console.log(`Test 3: Trying to connect to database '${databaseName}'...`);
    const dbConnection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password: password,
      database: databaseName, // Try to connect to the specific database
    });
    
    console.log(`✅ Connected to database '${databaseName}' successfully`);
    
    // Test 4: Run a simple query
    console.log('Test 4: Running a simple query...');
    const [result] = await dbConnection.execute('SELECT 1 as test_value');
    console.log('Query result:', result);
    
    await dbConnection.end();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test completed successfully',
      tests: {
        serverConnection: true,
        databaseListing: true,
        databaseConnection: true,
        queryExecution: true
      },
      availableDatabases: databases,
      connectionDetails: {
        host,
        port: parseInt(port),
        username,
        databaseName
      },
      queryResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
