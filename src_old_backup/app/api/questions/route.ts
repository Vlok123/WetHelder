import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const questions = await prisma.question.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions error:', error);
    return NextResponse.json(
      { message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
} 