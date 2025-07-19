import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

// Helper function to get local time in UTC+2 timezone
const getLocalTime = () => {
  const now = new Date();
  // Add 2 hours to UTC to get your local time
  const localTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return localTime;
};

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedbackSystems = await prisma.customerFeedbackSystem.findMany({
      where: {
        business_area: {
          in: userBusinessAreas
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(feedbackSystems);
  } catch (error) {
    console.error('Error fetching customer feedback systems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback systems' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);
    
    const feedbackSystem = await prisma.customerFeedbackSystem.create({
      data: {
        business_area: body.business_area,
        has_feedback_system: body.has_feedback_system,
        document_reference: body.document_reference || '',
        last_review_date: body.last_review_date ? new Date(body.last_review_date) : null,
        status_percentage: body.status_percentage || 0,
        doc_status: body.doc_status || 'Not Started',
        progress: body.progress || 'New',
        notes: body.notes || '',
        created_at: getLocalTime(),
        updated_at: getLocalTime()
      }
    });

    return NextResponse.json(feedbackSystem, { status: 201 });
  } catch (error) {
    console.error('Error creating customer feedback system:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback system' },
      { status: 500 }
    );
  }
} 