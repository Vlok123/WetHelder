import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    // Haal alle vragen op van de gebruiker
    const totalQuestions = await prisma.question.count({
      where: {
        userId: session.user.id,
      },
    });

    // Haal alle favorieten op van de gebruiker
    const totalFavorites = await prisma.favorite.count({
      where: {
        userId: session.user.id,
      },
    });

    // Bereken vragen van deze maand
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const questionsThisMonth = await prisma.question.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Bereken gemiddeld aantal vragen per maand
    const firstQuestion = await prisma.question.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    let averageQuestionsPerMonth = 0;
    if (firstQuestion) {
      const monthsSinceFirstQuestion =
        (new Date().getTime() - firstQuestion.createdAt.getTime()) /
        (1000 * 60 * 60 * 24 * 30.44); // Gemiddeld aantal dagen per maand
      averageQuestionsPerMonth = totalQuestions / Math.max(1, monthsSinceFirstQuestion);
    }

    return NextResponse.json({
      totalQuestions,
      totalFavorites,
      questionsThisMonth,
      averageQuestionsPerMonth,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
} 