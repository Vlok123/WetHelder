'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  content: string;
  answer: string;
  createdAt: string;
  isHighlight: boolean;
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Er is een fout opgetreden');
        }

        setQuestions(data.questions);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Er is een fout opgetreden');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchQuestions();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Vraaggeschiedenis
          </h1>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600 mb-4">
              Log in om uw vraaggeschiedenis te bekijken
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Uw vraaggeschiedenis
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-600">Laden...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : questions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-600 mb-4">
              U heeft nog geen vragen gesteld
            </p>
            <Link
              href="/ask"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Stel uw eerste vraag
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">
                      {new Date(question.createdAt).toLocaleString('nl-NL')}
                    </p>
                    <h2 className="text-xl font-semibold text-gray-900 mt-2 mb-4">
                      {question.content}
                    </h2>
                    <div className="prose max-w-none">{question.answer}</div>
                  </div>
                  {question.isHighlight && (
                    <span className="ml-4 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md">
                      Uitgelicht
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 