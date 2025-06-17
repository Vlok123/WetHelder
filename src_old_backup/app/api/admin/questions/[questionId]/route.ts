import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const { questionId } = params;
    const body = await request.json();
    const { isHighlight } = body;

    if (typeof isHighlight !== 'boolean') {
      return NextResponse.json(
        { message: 'Ongeldige invoer' },
        { status: 400 }
      );
    }

    const question = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        isHighlight,
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Admin question update error:', error);
    return NextResponse.json(
      { message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
} 