import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

// GET all business documents
export async function GET() {
  try {
    console.log('Fetching documents...');
    const documents = await prisma.businessDocument.findMany();
    console.log('Found documents:', JSON.stringify(documents, null, 2));
    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    return NextResponse.json({ 
      error: 'Failed to fetch documents',
      details: error?.message 
    }, { status: 500 });
  }
}

// POST (create) a new business document
export async function POST(request: Request) {
  try {
    console.log('Received POST request');
    const data = await request.json();
    console.log('Creating document with data:', JSON.stringify(data, null, 2));
    
    if (!data) {
      throw new Error('No data provided');
    }

    // Validate required fields
    const requiredFields = ['businessArea', 'subBusinessArea', 'nameAndNumbering', 'documentName', 'documentType', 'version', 'progress', 'status', 'priority', 'targetDate', 'documentOwner'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Ensure dates are properly formatted and all required fields are present
    const documentData = {
      id: crypto.randomUUID(),
      businessArea: data.businessArea,
      subBusinessArea: data.subBusinessArea,
      nameAndNumbering: data.nameAndNumbering,
      documentName: data.documentName,
      documentType: data.documentType,
      version: data.version,
      progress: data.progress,
      status: data.status,
      statusPercentage: parseInt(data.statusPercentage, 10),
      priority: data.priority,
      targetDate: new Date(data.targetDate),
      documentOwner: data.documentOwner,
      updateDate: new Date(),
      remarks: data.remarks || null,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Processed data:', JSON.stringify(documentData, null, 2));
    
    const document = await prisma.businessDocument.create({
      data: documentData,
    });
    
    console.log('Created document:', JSON.stringify(document, null, 2));
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ 
      error: 'Failed to create document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT (update) a business document
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await request.json();
    console.log('Updating document:', id, data);
    
    // Format dates properly
    const updateData = {
      businessArea: data.businessArea,
      subBusinessArea: data.subBusinessArea,
      nameAndNumbering: data.nameAndNumbering,
      documentName: data.documentName,
      documentType: data.documentType,
      version: data.version,
      progress: data.progress,
      status: data.status,
      statusPercentage: parseInt(data.statusPercentage, 10),
      priority: data.priority,
      targetDate: new Date(data.targetDate),
      documentOwner: data.documentOwner,
      updateDate: new Date(),
      remarks: data.remarks || null,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      updatedAt: new Date()
    };
    
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const document = await prisma.businessDocument.update({
      where: { id },
      data: updateData,
    });
    
    console.log('Updated document:', document);
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ 
      error: 'Failed to update document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE a business document
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log('Deleting document:', id);
    await prisma.businessDocument.delete({
      where: { id },
    });
    console.log('Document deleted successfully');
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
} 