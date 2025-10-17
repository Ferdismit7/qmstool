import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Basic API test successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Basic test error:', error);
    return NextResponse.json(
      { 
        error: 'Basic test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessArea = formData.get('businessArea') as string;
    const documentType = formData.get('documentType') as string;
    
    return NextResponse.json({
      success: true,
      message: 'Basic POST test successful',
      data: {
        fileName: file?.name || 'No file',
        fileSize: file?.size || 0,
        businessArea: businessArea || 'No business area',
        documentType: documentType || 'No document type'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Basic POST test error:', error);
    return NextResponse.json(
      { 
        error: 'Basic POST test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}