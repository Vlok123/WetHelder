import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
} 