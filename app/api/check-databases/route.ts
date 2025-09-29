import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('Checking databases endpoint called');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Parse the DATABASE_URL to get connection details
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not available');
    }
    
    // Extract connection details from DATABASE_URL
    const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, username, password, host, port, databaseName] = urlMatch;
    
    // Decode the password
    const decodedPassword = decodeURIComponent(password);
    
    console.log('Connection details:', {
      host,
      port: parseInt(port),
      username,
      databaseName,
      passwordLength: decodedPassword.length
    });
    
    // Connect to the RDS instance without specifying a database
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password: decodedPassword,
      // Don't specify database - connect to the server directly
    });
    
    console.log('✅ Connected to RDS instance successfully');
    
    // List all databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:', databases);
    
    // Check if our target database exists
    const targetDb = 'database-qms-1';
    const dbExists = databases.some((db: any) => db.Database === targetDb);
    
    console.log(`Database '${targetDb}' exists:`, dbExists);
    
    // If database doesn't exist, create it
    if (!dbExists) {
      console.log(`Creating database '${targetDb}'...`);
      await connection.execute(`CREATE DATABASE \`${targetDb}\``);
      console.log(`✅ Database '${targetDb}' created successfully`);
    }
    
    // Test connection to the target database
    await connection.execute(`USE \`${targetDb}\``);
    const [result] = await connection.execute('SELECT DATABASE() as current_db');
    console.log('✅ Connected to target database:', result);
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      message: 'Database check completed',
      availableDatabases: databases,
      targetDatabase: targetDb,
      databaseExists: dbExists,
      currentDatabase: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
