import { NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Define initial business areas
    const businessAreas = [
      'Dental Management',
      'Medical Management',
      'Pharmacy Management',
      'Laboratory Management',
      'Radiology Management',
      'Nursing Management',
      'Administration',
      'Human Resources',
      'Finance',
      'IT Management',
      'Quality Management',
      'Facility Management',
      'Risk Management',
      'Compliance',
      'Patient Services'
    ];

    // Create business areas
    const createdAreas = await Promise.all(
      businessAreas.map(async (area) => {
        return prisma.businessAreas.upsert({
          where: { business_area: area },
          update: {},
          create: { business_area: area }
        });
      })
    );

    return NextResponse.json({
      message: 'Business areas setup completed',
      areas: createdAreas
    });
  } catch (error) {
    console.error('Setup Error:', error);
    return NextResponse.json(
      { error: 'Failed to setup business areas' },
      { status: 500 }
    );
  }
} 