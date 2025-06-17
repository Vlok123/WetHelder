"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Statistics {
  totalQuestions: number;
  totalFavorites: number;
  questionsThisMonth: number;
  averageQuestionsPerMonth: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  questionNotifications: boolean;
  systemUpdates: boolean;
  favoriteNotifications: boolean;
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userQuestions, setUserQuestions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    questionNotifications: true,
    systemUpdates: true,
    favoriteNotifications: true,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (session?.user) {
      // Fetch user's questions
      fetch("/api/questions?userId=" + session.user.id)
        .then((res) => res.json())
        .then((data) => {
          setUserQuestions(data);
        });

      // Fetch user's favorites
      fetch("/api/favorites")
        .then((res) => res.json())
        .then((data) => {
          setFavorites(data);
        });

      // Fetch user's statistics
      fetch("/api/profile/statistics")
        .then((res) => res.json())
        .then((data) => {
          setStatistics(data);
        });

      // Fetch notification settings
      fetch("/api/profile/notifications/settings")
        .then((res) => res.json())
        .then((data) => {
          setNotificationSettings(data);
        });

      // Fetch activity logs
      fetch("/api/profile/activity")
        .then((res) => res.json())
        .then((data) => {
          setActivityLogs(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session, status, router]);

  const handleNotificationSettingChange = async (setting: keyof NotificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    };
    
    try {
      const response = await fetch("/api/profile/notifications/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });
      
      if (response.ok) {
        setNotificationSettings(newSettings);
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Laden...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Mijn Profiel</h1>
      
      {/* Persoonlijke Informatie */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Persoonlijke Informatie</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1">{session?.user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <p className="mt-1">{session?.user?.role === "ADMIN" ? "Administrator" : "Gebruiker"}</p>
          </div>
        </div>
      </div>

      {/* Statistieken */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Statistieken</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Totaal Vragen</p>
            <p className="text-2xl font-bold">{statistics?.totalQuestions || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Totaal Favorieten</p>
            <p className="text-2xl font-bold">{statistics?.totalFavorites || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Vragen Deze Maand</p>
            <p className="text-2xl font-bold">{statistics?.questionsThisMonth || 0}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">Gemiddeld per Maand</p>
            <p className="text-2xl font-bold">{statistics?.averageQuestionsPerMonth?.toFixed(1) || 0}</p>
          </div>
        </div>
      </div>

      {/* Notificatie Instellingen */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notificatie Instellingen</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notificaties</h3>
              <p className="text-sm text-gray-500">Ontvang belangrijke updates via email</p>
            </div>
            <button
              onClick={() => handleNotificationSettingChange("emailNotifications")}
              className={`${
                notificationSettings.emailNotifications
                  ? "bg-blue-600"
                  : "bg-gray-200"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
            >
              <span
                className={`${
                  notificationSettings.emailNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Vraag Notificaties</h3>
              <p className="text-sm text-gray-500">Ontvang updates over je vragen</p>
            </div>
            <button
              onClick={() => handleNotificationSettingChange("questionNotifications")}
              className={`${
                notificationSettings.questionNotifications
                  ? "bg-blue-600"
                  : "bg-gray-200"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
            >
              <span
                className={`${
                  notificationSettings.questionNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Systeem Updates</h3>
              <p className="text-sm text-gray-500">Ontvang updates over nieuwe features</p>
            </div>
            <button
              onClick={() => handleNotificationSettingChange("systemUpdates")}
              className={`${
                notificationSettings.systemUpdates
                  ? "bg-blue-600"
                  : "bg-gray-200"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
            >
              <span
                className={`${
                  notificationSettings.systemUpdates
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Favorieten Updates</h3>
              <p className="text-sm text-gray-500">Ontvang updates over je favoriete vragen</p>
            </div>
            <button
              onClick={() => handleNotificationSettingChange("favoriteNotifications")}
              className={`${
                notificationSettings.favoriteNotifications
                  ? "bg-blue-600"
                  : "bg-gray-200"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
            >
              <span
                className={`${
                  notificationSettings.favoriteNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Activiteitenlog */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Activiteitenlog</h2>
        <div className="space-y-4">
          {activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log.id} className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{log.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                    {log.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Geen recente activiteiten.</p>
          )}
        </div>
      </div>

      {/* Vragen en Favorieten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mijn Vragen</h2>
          {userQuestions.length > 0 ? (
            <ul className="space-y-4">
              {userQuestions.map((question: any) => (
                <li key={question.id} className="border-b pb-4">
                  <p className="font-medium">{question.content}</p>
                  <p className="text-sm text-gray-500">
                    Gesteld op: {new Date(question.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Je hebt nog geen vragen gesteld.</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mijn Favorieten</h2>
          {favorites.length > 0 ? (
            <ul className="space-y-4">
              {favorites.map((favorite: any) => (
                <li key={favorite.id} className="border-b pb-4">
                  <p className="font-medium">{favorite.question.content}</p>
                  <p className="text-sm text-gray-500">
                    Toegevoegd op: {new Date(favorite.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Je hebt nog geen favorieten toegevoegd.</p>
          )}
        </div>
      </div>
    </div>
  );
} 