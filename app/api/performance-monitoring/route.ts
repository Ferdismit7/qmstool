import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.performanceMonitoringControl.findMany({
      where: {
        business_area: {
          in: userBusinessAreas
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance monitoring controls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sub_business_area,
      Name_reports,
      doc_type,
      priority,
      doc_status,
      progress,
      status_percentage,
      target_date,
      proof,
      frequency,
      responsible_persons,
      remarks
    } = body;

    // Validate required fields
    if (!Name_reports) {
      return NextResponse.json(
        { error: 'Name reports is required' },
        { status: 400 }
      );
    }

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

    const result = await prisma.performanceMonitoringControl.create({
      data: {
        business_area: userBusinessArea,
        sub_business_area,
        Name_reports,
        doc_type,
        priority,
        doc_status,
        progress,
        status_percentage,
        target_date: target_date ? new Date(target_date) : null,
        proof,
        frequency,
        responsible_persons,
        remarks
      }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create performance monitoring control' },
      { status: 500 }
    );
  }
} 