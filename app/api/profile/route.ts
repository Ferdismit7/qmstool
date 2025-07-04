import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const tokenUser = await getUserFromToken(req);

    if (!tokenUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Raw query to get business areas
    const userBusinessAreas: { business_area: string }[] = await prisma.$queryRaw`
      SELECT business_area FROM user_business_areas WHERE user_id = ${user.id}
    `;
    const businessAreas = userBusinessAreas.map(uba => uba.business_area);

    const { password, ...userWithoutPassword } = user;
    const userData = { ...userWithoutPassword, business_areas: businessAreas };

    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
} 

export async function PUT(req: NextRequest) {
  try {
    const tokenUser = await getUserFromToken(req);
    if (!tokenUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = tokenUser.userId;

    const { username, email, business_areas, password } = await req.json();

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    if (username && username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 400 });
      }
    }
    
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
      }
    }

    const dataToUpdate: any = {
      username,
      email,
      business_area: business_areas && business_areas.length > 0 ? business_areas[0] : null,
    };
  
    if (password) {
      const bcrypt = require('bcrypt');
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Use a transaction with raw SQL
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });

      await tx.$executeRaw`DELETE FROM user_business_areas WHERE user_id = ${userId}`;

      if (business_areas && business_areas.length > 0) {
        const values = business_areas.map((area: string) => `(${userId}, '${area}')`).join(', ');
        await tx.$executeRawUnsafe(`INSERT INTO user_business_areas (user_id, business_area) VALUES ${values}`);
      }
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    const { password: _, ...userWithoutPassword } = updatedUser!;

    return NextResponse.json({ success: true, data: userWithoutPassword });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
} 