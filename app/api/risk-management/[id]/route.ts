import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET a single risk management control
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rows = await query(
      'SELECT * FROM racm_matrix WHERE id = ?',
      [params.id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'Risk management control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk management control' },
      { status: 500 }
    );
  }
}

// DELETE a risk management control
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM racm_matrix WHERE id = ?', [params.id]);

    return NextResponse.json({ message: 'Risk management control deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk management control' },
      { status: 500 }
    );
  }
} 