import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const { userId } = params;
    const body = await request.json();
    const { isBlocked } = body;

    if (typeof isBlocked !== 'boolean') {
      return NextResponse.json(
        { message: 'Ongeldige invoer' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isBlocked,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
} 