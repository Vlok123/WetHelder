import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    let settings = await prisma.notificationSetting.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Als er nog geen instellingen zijn, maak ze aan met standaardwaarden
    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          questionNotifications: true,
          systemUpdates: true,
          favoriteNotifications: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    const updates = await request.json();

    // Update de instellingen
    const settings = await prisma.notificationSetting.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        emailNotifications: updates.emailNotifications,
        questionNotifications: updates.questionNotifications,
        systemUpdates: updates.systemUpdates,
        favoriteNotifications: updates.favoriteNotifications,
      },
      create: {
        userId: session.user.id,
        emailNotifications: updates.emailNotifications,
        questionNotifications: updates.questionNotifications,
        systemUpdates: updates.systemUpdates,
        favoriteNotifications: updates.favoriteNotifications,
      },
    });

    // Log de activiteit
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "SETTINGS_UPDATED",
        description: "Notificatie instellingen bijgewerkt",
        metadata: JSON.stringify(updates),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
} 