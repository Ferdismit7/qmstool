import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple upload test called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessArea = formData.get('businessArea') as string;
    const documentType = formData.get('documentType') as string;
    const recordId = formData.get('recordId') as string;
    
    console.log('Form data received:', {
      fileName: file?.name,
      fileSize: file?.size,
      businessArea,
      documentType,
      recordId
    });
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!businessArea || !documentType) {
      return NextResponse.json(
        { error: 'Business area and document type are required' },
        { status: 400 }
      );
    }
    
    // Simulate file processing
    const fileBuffer = await file.arrayBuffer();
    const fileSize = fileBuffer.byteLength;
    
    return NextResponse.json({
      success: true,
      message: 'Simple upload test successful',
      data: {
        fileName: file.name,
        fileSize: fileSize,
        businessArea,
        documentType,
        recordId: recordId || null,
        processedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Simple upload test error:', error);
    return NextResponse.json(
      { 
        error: 'Simple upload test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
