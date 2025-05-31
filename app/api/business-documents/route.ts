import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// Helper function to create database connection
async function createConnection() {
  return await mysql.createConnection(dbConfig);
}

// GET all business documents
export async function GET() {
  let connection;
  try {
    connection = await createConnection();
    const [rows] = await connection.execute('SELECT * FROM businessdocumentregister ORDER BY update_date DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error in GET /api/business-documents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch documents',
      details: error?.message 
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// POST (create) a new business document
export async function POST(request: Request) {
  let connection;
  try {
    const data = await request.json();
    connection = await createConnection();
    
    const [result] = await connection.execute(
      `INSERT INTO businessdocumentregister (
        business_area, sub_business_area, document_name, name_and_numbering,
        document_type, version, progress, status, status_percentage,
        priority, target_date, document_owner, update_date, remarks, review_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.business_area,
        data.sub_business_area,
        data.document_name,
        data.name_and_numbering,
        data.document_type,
        data.version,
        data.progress,
        data.status,
        data.status_percentage,
        data.priority,
        data.target_date,
        data.document_owner,
        new Date().toISOString().split('T')[0], // update_date
        data.remarks,
        data.review_date
      ]
    );

    const insertResult = result as mysql.ResultSetHeader;
    return NextResponse.json({ 
      message: 'Document created successfully',
      id: insertResult.insertId,
      ...data 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ 
      error: 'Failed to create document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// PUT (update) a business document
export async function PUT(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await request.json();
    connection = await createConnection();
    
    await connection.execute(
      `UPDATE businessdocumentregister SET
        business_area = ?,
        sub_business_area = ?,
        document_name = ?,
        name_and_numbering = ?,
        document_type = ?,
        version = ?,
        progress = ?,
        status = ?,
        status_percentage = ?,
        priority = ?,
        target_date = ?,
        document_owner = ?,
        update_date = NOW(),
        remarks = ?,
        review_date = ?
      WHERE id = ?`,
      [
        data.business_area,
        data.sub_business_area,
        data.document_name,
        data.name_and_numbering,
        data.document_type,
        data.version,
        data.progress,
        data.status,
        data.status_percentage,
        data.priority,
        data.target_date,
        data.document_owner,
        // update_date is set by SQL NOW()
        data.remarks,
        data.review_date,
        id
      ]
    );

    return NextResponse.json({ 
      message: 'Document updated successfully',
      id,
      ...data 
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ 
      error: 'Failed to update document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// DELETE a business document
export async function DELETE(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    connection = await createConnection();
    await connection.execute('DELETE FROM businessdocumentregister WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ 
      error: 'Failed to delete document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
} 