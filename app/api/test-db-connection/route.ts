import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { query } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection endpoint called');
    
    // Test 1: Initialize secrets first
    console.log('Step 1: Initializing secrets...');
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Test 2: Test raw MySQL connection
    console.log('Step 2: Testing raw MySQL connection...');
    const mysqlResult = await query('SELECT 1 as test_value');
    console.log('✅ Raw MySQL connection successful:', mysqlResult);
    
    // Test 3: Test Prisma connection
    console.log('Step 3: Testing Prisma connection...');
    const prismaResult = await prisma.$queryRaw`SELECT 1 as test_value`;
    console.log('✅ Prisma connection successful:', prismaResult);
    
    // Test 4: Test a simple table query (if users table exists)
    console.log('Step 4: Testing table access...');
    try {
      const userCount = await prisma.user.count();
      console.log('✅ User table accessible, count:', userCount);
    } catch (tableError) {
      console.log('⚠️ User table not accessible (this might be expected):', tableError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      tests: {
        secretsInitialized: true,
        mysqlConnection: true,
        prismaConnection: true,
        timestamp: new Date().toISOString()
      }
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
