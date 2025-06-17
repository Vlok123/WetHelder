'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const roles = [
  { id: 'algemeen', label: 'Algemeen' },
  { id: 'politieagent', label: 'Politieagent' },
  { id: 'advocaat', label: 'Advocaat' },
  { id: 'rechter', label: 'Rechter' },
  { id: 'burger', label: 'Burger' },
  { id: 'zorgprofessional', label: 'Zorgprofessional' },
];

export default function AskPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const [question, setQuestion] = useState(searchParams.get('q') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('profile') || 'algemeen');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState(0);

  // Load answer from URL parameter on mount only
  useEffect(() => {
    const answerParam = searchParams.get('answer');
    if (answerParam) {
      setAnswer(decodeURIComponent(answerParam));
    }
  }, [searchParams]); // Include searchParams dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          profession: selectedRole,
          history: []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          router.push('/register');
          return;
        }
        throw new Error(errorData.error || 'Er is een fout opgetreden bij het verwerken van uw vraag');
      }

      // The API returns a streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullAnswer += decoder.decode(value);
        }
      }
      
      setAnswer(fullAnswer);
      
      // Update questionCount for non-registered users
      if (!session) {
        setQuestionCount((prev) => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Stel uw juridische vraag
        </h1>

        {!session && questionCount >= 4 ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-600 mb-4">
              U heeft het maximaal aantal gratis vragen bereikt.
            </p>
            <Link
              href="/register"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Maak een account aan
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Selecteer uw rol
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedRole === role.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Uw vraag
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Typ hier uw vraag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Bezig...' : 'Vraag stellen'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </form>
        )}

        {answer && (
          <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Antwoord
            </h2>
            <div className="prose prose-sm sm:prose max-w-none">
              {answer.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {!session && questionCount === 1 && (
          <div className="mt-6 text-center text-sm sm:text-base text-gray-600">
            <p>
              Nog {4 - questionCount} gratis {4 - questionCount === 1 ? 'vraag' : 'vragen'} over.{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Registreer
              </Link>{' '}
              voor onbeperkt vragen stellen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 