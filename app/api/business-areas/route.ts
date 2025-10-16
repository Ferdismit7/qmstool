import { NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    // Initialize secrets from AWS Secrets Manager
    await initializeSecrets();
    
    // Fetch business areas using Prisma
    const businessAreas = await prisma.businessAreas.findMany({
      select: { business_area: true },
      orderBy: { business_area: 'asc' }
    });

    return NextResponse.json({ success: true, data: businessAreas });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business areas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Initialize secrets from AWS Secrets Manager
    await initializeSecrets();
    
    const { business_area } = await request.json();

    if (!business_area || typeof business_area !== 'string' || business_area.trim() === '') {
      return NextResponse.json(
        { message: 'Business area is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const trimmedBusinessArea = business_area.trim();

    // Check if business area already exists
    const existingArea = await prisma.businessAreas.findUnique({
      where: { business_area: trimmedBusinessArea }
    });

    if (existingArea) {
      return NextResponse.json(
        { message: 'Business area already exists' },
        { status: 400 }
      );
    }

    // Add new business area
    await prisma.businessAreas.create({
      data: { business_area: trimmedBusinessArea }
    });

    return NextResponse.json(
      { message: 'Business area added successfully', business_area: trimmedBusinessArea },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to add business area' },
      { status: 500 }
    );
  }
} 