import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { getCurrentUserBusinessAreas } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: []
  };

  try {
    // Step 1: Check environment variables
    diagnostics.steps.push({
      step: '1. Environment Variables Check',
      lambdaUrl: {
        LAMBDA_FUNCTION_URL: !!process.env.LAMBDA_FUNCTION_URL,
        NEXT_PUBLIC_LAMBDA_FUNCTION_URL: !!process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL
      },
      otherVars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV
      }
    });

    // Step 2: Try to initialize secrets
    try {
      await initializeSecrets();
      diagnostics.steps.push({
        step: '2. Initialize Secrets',
        status: 'SUCCESS',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET
      });
    } catch (secretsError) {
      diagnostics.steps.push({
        step: '2. Initialize Secrets',
        status: 'FAILED',
        error: secretsError instanceof Error ? secretsError.message : 'Unknown error',
        errorType: secretsError instanceof Error ? secretsError.name : 'Unknown'
      });
      throw secretsError;
    }

    // Step 3: Try to get user business areas (this is what most API routes do)
    try {
      const mockRequest = new Request('http://localhost/api/test', {
        headers: {
          'Cookie': 'authToken=test'
        }
      });
      const businessAreas = await getCurrentUserBusinessAreas(mockRequest as unknown as Parameters<typeof getCurrentUserBusinessAreas>[0]);
      diagnostics.steps.push({
        step: '3. Get User Business Areas',
        status: 'SUCCESS',
        businessAreasCount: businessAreas.length
      });
    } catch (businessAreasError) {
      diagnostics.steps.push({
        step: '3. Get User Business Areas',
        status: 'FAILED',
        error: businessAreasError instanceof Error ? businessAreasError.message : 'Unknown error',
        errorType: businessAreasError instanceof Error ? businessAreasError.name : 'Unknown',
        stack: businessAreasError instanceof Error ? businessAreasError.stack : undefined
      });
    }

    // Step 4: Try to access Prisma
    try {
      const userCount = await prisma.user.count();
      diagnostics.steps.push({
        step: '4. Prisma Access',
        status: 'SUCCESS',
        userCount
      });
    } catch (prismaError) {
      diagnostics.steps.push({
        step: '4. Prisma Access',
        status: 'FAILED',
        error: prismaError instanceof Error ? prismaError.message : 'Unknown error',
        errorType: prismaError instanceof Error ? prismaError.name : 'Unknown',
        stack: prismaError instanceof Error ? prismaError.stack : undefined
      });
    }

    diagnostics.success = true;
    return NextResponse.json(diagnostics);
  } catch (error) {
    diagnostics.success = false;
    diagnostics.finalError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    };
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
