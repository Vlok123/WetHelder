import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { question, profile } = await request.json();
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

    if (!question) {
      return NextResponse.json(
        { error: 'Vraag is verplicht' },
        { status: 400 }
      );
    }

    // Als de gebruiker niet is ingelogd, controleer het aantal vragen
    if (!session?.user) {
      const anonQuestions = await prisma.question.count({
        where: {
          anonymousIp: clientIp,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Laatste 24 uur
          }
        }
      });

      if (anonQuestions >= 2) {
        return NextResponse.json(
          { error: 'Maak een account aan om meer vragen te stellen' },
          { status: 403 }
        );
      }
    }

    // Hier komt de logica voor het verwerken van de vraag
    // Dit is een placeholder voor de echte implementatie
    const answer = `Dit is een voorbeeldantwoord voor de vraag: "${question}" vanuit het perspectief van een ${profile}.`;

    // Sla de vraag op in de database
    const savedQuestion = await prisma.question.create({
      data: {
        content: question,
        answer: answer,
        profile: profile,
        userId: session?.user?.id || null,
        anonymousIp: !session?.user ? clientIp : null
      }
    });

    return NextResponse.json({ 
      answer,
      questionId: savedQuestion.id 
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get('id');
  const question = searchParams.get('q');
  const profile = searchParams.get('profile');

  // If we have a question ID, return that specific question
  if (questionId) {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        return NextResponse.json(
          { error: 'Vraag niet gevonden' },
          { status: 404 }
        );
      }

      return NextResponse.json(question);
    } catch (error) {
      console.error('Error in GET /api/ask:', error);
      return NextResponse.json(
        { error: 'Er is een fout opgetreden' },
        { status: 500 }
      );
    }
  }
  
  // If we have a new question, redirect to POST
  if (question && profile) {
    return NextResponse.json(
      { error: 'Gebruik POST voor nieuwe vragen' },
      { status: 405 }
    );
  }

  return NextResponse.json(
    { error: 'Vraag ID of nieuwe vraag is verplicht' },
    { status: 400 }
  );
} 