import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    // Get all documents with their business areas
    const documents = await query(`
      SELECT id, business_area, document_name, doc_status, deleted_at
      FROM businessdocumentregister 
      ORDER BY id ASC
      LIMIT 20
    `);

    // Get all business areas
    const businessAreas = await query(`
      SELECT business_area 
      FROM businessareas 
      ORDER BY business_area ASC
    `);

    // Check if document ID 1 exists specifically
    const [documentOne] = await query(`
      SELECT id, business_area, document_name, doc_status, deleted_at
      FROM businessdocumentregister 
      WHERE id = 1
    `);

    // Get user's business areas (simulate the auth check)
    const userBusinessAreas = ['Dental Management', 'Installer']; // Based on the logs

    return NextResponse.json({
      documents: documents,
      businessAreas: businessAreas.map((row: unknown) => (row as { business_area: string }).business_area),
      totalDocuments: documents.length,
      totalBusinessAreas: businessAreas.length,
      documentIdOne: documentOne || null,
      userBusinessAreas: userBusinessAreas,
             issue: documentOne ? 
         (userBusinessAreas.includes((documentOne as { business_area: string }).business_area) ? 
           'Document exists and user has access - check other issues' : 
           'Document exists but user does not have access to this business area') :
         'Document ID 1 does not exist in the database'
    });
  } catch (error) {
    console.error('Error debugging documents:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
