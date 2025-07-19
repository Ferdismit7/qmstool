import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const evaluations = await prisma.thirdPartyEvaluation.findMany({
      where: {
        business_area: {
          in: userBusinessAreas
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching third-party evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}

// Helper function to get local time in UTC+2 timezone
const getLocalTime = () => {
  const now = new Date();
  // Add 2 hours to UTC to get your local time
  const localTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return localTime;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);
    
    const evaluation = await prisma.thirdPartyEvaluation.create({
      data: {
        supplier_name: body.supplier_name,
        business_area: body.business_area,
        evaluation_system_in_place: body.evaluation_system_in_place,
        document_reference: body.document_reference || '',
        last_evaluation_date: body.last_evaluation_date ? new Date(body.last_evaluation_date) : null,
        status_percentage: body.status_percentage || 0,
        doc_status: body.doc_status || 'Not Started',
        progress: body.progress || 'New',
        notes: body.notes || '',
        created_at: getLocalTime(),
        updated_at: getLocalTime()
      }
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error('Error creating third-party evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    );
  }
} 