import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessArea = searchParams.get('businessArea');
    if (!businessArea) {
      return NextResponse.json({ success: false, error: 'Missing businessArea query param' }, { status: 400 });
    }
    // Get all status_percentage values from both tables for the business area
    const processes = await query(
      'SELECT status_percentage FROM businessprocessregister WHERE business_area = ?',
      [businessArea]
    );
    const perfMon = await query(
      'SELECT status_percentage FROM performancemonitoringcontrol WHERE business_area = ?',
      [businessArea]
    );
    // Collect only valid percentage values
    const allPercentages: number[] = [];
    for (const p of processes) {
      if (p.status_percentage !== null && p.status_percentage !== undefined && !isNaN(Number(p.status_percentage))) {
        const val = Math.min(Math.max(Number(p.status_percentage), 0), 100);
        allPercentages.push(val);
      }
    }
    for (const p of perfMon) {
      if (p.status_percentage !== null && p.status_percentage !== undefined && !isNaN(Number(p.status_percentage))) {
        const val = Math.min(Math.max(Number(p.status_percentage), 0), 100);
        allPercentages.push(val);
      }
    }
    const total = allPercentages.length;
    const avg = total > 0 ? allPercentages.reduce((sum, v) => sum + v, 0) / total : 0;
    return NextResponse.json({
      success: true,
      businessArea,
      values: allPercentages,
      count: total,
      average: avg
    });
  } catch (error) {
    console.error('Error in debug-operations-summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch debug summary' }, { status: 500 });
  }
} 