import { NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Log environment variables (without sensitive data)
    console.log('NODE_ENV:', process.env.NODE_ENV);
    // SECURITY FIX: Removed environment variable logging
    // console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL); // REMOVED
    // console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0); // REMOVED
    
    console.log('Prisma client imported successfully');

    // Check if Prisma is available
    if (!prisma) {
      console.error('Prisma client not available');
      return NextResponse.json({
        error: 'Prisma client not available',
        details: 'Database client not initialized - check environment variables',
        environment: process.env.NODE_ENV,
        // SECURITY FIX: Removed environment variable exposure
        // hasDatabaseUrl: !!process.env.DATABASE_URL // REMOVED
      }, { status: 500 });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
      
      // Test a simple query
      const userCount = await prisma.user.count();
      console.log('User count:', userCount);
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        userCount,
        environment: process.env.NODE_ENV,
        // SECURITY FIX: Removed environment variable exposure
        // hasDatabaseUrl: !!process.env.DATABASE_URL // REMOVED
      });
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        environment: process.env.NODE_ENV,
        // SECURITY FIX: Removed environment variable exposure
        // hasDatabaseUrl: !!process.env.DATABASE_URL // REMOVED
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json({
      error: 'Test route failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 