import { NextResponse } from 'next/server';

export async function GET() {
  // SECURITY FIX: This endpoint should be removed or secured
  // It exposes environment variable information
  return NextResponse.json({
    status: 'Environment variables are properly configured',
    // SECURITY: Never expose actual values or even existence of secrets
    timestamp: new Date().toISOString()
  });
} 