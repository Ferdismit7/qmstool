import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('Prisma connected successfully');
    
    // Test if we can access the businessDocumentRegister model
    console.log('Testing businessDocumentRegister model...');
    const count = await prisma.businessDocumentRegister.count();
    console.log('Document count:', count);
    
    // Test if we can access the businessProcessRegister model
    console.log('Testing businessProcessRegister model...');
    const processCount = await prisma.businessProcessRegister.count();
    console.log('Process count:', processCount);
    
    // Test if we can access the businessAreas model
    console.log('Testing businessAreas model...');
    const areaCount = await prisma.businessAreas.count();
    console.log('Area count:', areaCount);
    
    return NextResponse.json({
      success: true,
      message: 'Prisma connection test completed',
      documentCount: count,
      processCount: processCount,
      areaCount: areaCount
    });
  } catch (error) {
    console.error('Prisma test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Prisma test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 